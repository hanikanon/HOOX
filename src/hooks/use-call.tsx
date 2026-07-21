import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type Peer from "peerjs";
import type { MediaConnection, DataConnection } from "peerjs";
import { pickAudioOutputSinkId, applySinkId } from "@/lib/audio-output";
import { sendCallPushNotification } from "@/lib/onesignal";
import { getOrCreateDeviceCode } from "@/lib/device-code";

type CallStatus = "idle" | "calling" | "ringing" | "connected";
type CallKind = "audio" | "video";
/** Whether audio/video packets are actually flowing between the two
 * devices — distinct from `status`, which only tracks the signaling-level
 * handshake. It's possible for `status` to say "connected" while this
 * stays "connecting" forever if the two networks (e.g. two different
 * mobile carriers) can never establish a working ICE/TURN path — that's
 * exactly what silent "no audio, no video, both sides" looks like. */
type MediaFlowState = "connecting" | "live" | "failed";

interface CallState {
  /** Your own call code — share this with someone so *they* can call *you*. */
  myCallId: string | null;
  /** Whether this device has actually finished connecting to the signaling
   * server yet. If this is false, calling won't work — not a "friend's
   * device" problem, this device just isn't ready. */
  connected: boolean;
  status: CallStatus;
  kind: CallKind;
  /** The other person's call code, once known (either you dialed them, or
   * their code arrived with an incoming call). */
  peerName: string | null;
  muted: boolean;
  cameraOff: boolean;
  /** Whether calls should route through the loudspeaker rather than the
   * earpiece. Best-effort — see lib/audio-output.ts for why this can't be
   * guaranteed on every Android WebView. */
  speakerOn: boolean;
  toggleSpeaker: () => void;
  seconds: number;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  /** True once we've detected that the WebView blocked automatic playback
   * of the remote audio (its autoplay policy requires a real tap first).
   * Only meaningful for audio-only calls — video calls handle their own
   * playback state locally in the overlay, since that's where the
   * <video> element lives. */
  playbackBlocked: boolean;
  /** See MediaFlowState — tells the UI whether audio/video packets are
   * actually reaching the other person, separately from `status`. */
  mediaState: MediaFlowState;
  /** Call this from a real user tap to retry playing the blocked remote
   * audio — browsers only allow media to start after a user gesture, so
   * this must run inside a click handler, not automatically. */
  retryPlayback: () => void;
  startCall: (remoteId: string, kind: CallKind) => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const CallContext = createContext<CallState | null>(null);

// ---- TURN servers -----------------------------------------------------
// A TURN relay is what lets two phones on completely different networks
// (different countries, different mobile carriers) actually exchange audio
// and video — without one, calls between such networks fail *even though
// the app UI can say "connected"* (the signaling handshake succeeds; the
// actual media never gets a path). No single free TURN provider is 100%
// reliable on its own, so this combines two independent ones — if one is
// overloaded or blocked on a given network, the browser can still find a
// working path through the other. Both are free and need no signup.
const STATIC_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // Open Relay Project (metered.ca) — shared demo TURN server, works on
  // ports 80/443 to get through most corporate/carrier firewalls.
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

/** A second, independent free TURN relay (elixir-webrtc/rel's public test
 * deployment) — no account needed, issues short-lived credentials on
 * request. Its maintainers note it's meant for testing rather than heavy
 * production traffic, so this is a bonus relay path layered on top of the
 * static one above, not a replacement for it. */
async function fetchBonusTurnServer(): Promise<RTCIceServer | null> {
  try {
    const username = `cv${Date.now()}`;
    const res = await fetch(`https://turn.elixir-webrtc.org/?service=turn&username=${username}`, {
      method: "POST",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { username?: string; password?: string; uris?: string[] };
    if (!data.uris?.length || !data.username || !data.password) return null;
    return { urls: data.uris, username: data.username, credential: data.password };
  } catch {
    // Offline, this particular server down, etc. — the static list above
    // still gives the call a chance.
    return null;
  }
}

async function fetchIceServers(): Promise<RTCIceServer[]> {
  const bonus = await fetchBonusTurnServer();
  return bonus ? [...STATIC_ICE_SERVERS, bonus] : STATIC_ICE_SERVERS;
}

// One random, memorable-ish code per device, generated once and kept in
// localStorage — this is what gets shown to the person as "your call code".
// See lib/device-code.ts (kept there, not here, so lib/onesignal.ts can
// reuse it without importing from this file and creating a circular
// dependency between the two).

export function CallProvider({ children }: { children: ReactNode }) {
  const [myCallId, setMyCallId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [kind, setKind] = useState<CallKind>("audio");
  const [peerName, setPeerName] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const speakerOnRef = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [mediaState, setMediaState] = useState<MediaFlowState>("connecting");

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCallRef = useRef<MediaConnection | null>(null);
  const pendingKindRef = useRef<CallKind>("audio");
  const visibilityHandlerRef = useRef<(() => void) | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceHandlerRef = useRef<(() => void) | null>(null);
  /** A dedicated, lightweight DataConnection used purely to signal "hang
   * up" reliably. PeerJS's built-in MediaConnection.close() is *supposed*
   * to notify the remote side on its own (fixed in peerjs 1.5+), but that
   * depends on an internal auxiliary data channel that itself needs ICE to
   * finish — on a flaky cross-network TURN-relayed call, that channel can
   * simply never open, so the close signal silently never arrives and the
   * other person's call just hangs there. Opening our own DataConnection
   * gives us a channel we control and can confirm is actually open. */
  const ctrlConnRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("peerjs"), fetchIceServers()]).then(([{ default: Peer }, iceServers]) => {
      if (cancelled) return;
      const code = getOrCreateDeviceCode();
      const peer = new Peer(`cryptvora-${code}`, {
        debug: 0,
        config: { iceServers },
      });
      peerRef.current = peer;

      peer.on("open", () => {
        setMyCallId(code);
        setConnected(true);
      });

      peer.on("disconnected", () => {
        setConnected(false);
        // PeerJS does NOT auto-reconnect on its own after a drop — without
        // this, a code goes silently dead (looks fine, shared, but nothing
        // ever arrives) the moment Android's battery-saving network policy
        // kills an idle background connection, which happens easily just
        // from the screen turning off for a bit.
        if (!peer.destroyed) peer.reconnect();
      });

      // Belt-and-suspenders: any time the app comes back to the foreground,
      // proactively make sure we're still connected. This is what actually
      // matters in practice — a friend generates a code, backgrounds the
      // app for a few minutes, then someone tries to call; without this,
      // that code is already dead by the time the call comes in.
      const onVisible = () => {
        if (document.visibilityState === "visible" && peer.disconnected && !peer.destroyed) {
          peer.reconnect();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onVisible);
      visibilityHandlerRef.current = onVisible;

      peer.on("error", (err) => {
        // "unavailable-id" just means this device already has an open
        // connection elsewhere (e.g. another tab) — not fatal.
        if (String(err).includes("unavailable-id")) return;
        setError("Connection problem — check your internet and try again.");
      });

      peer.on("call", (incoming) => {
        // Someone is calling this device right now. The caller tells us
        // whether it's a video or voice call via metadata.
        const incomingKind: CallKind = incoming.metadata?.kind === "video" ? "video" : "audio";
        pendingCallRef.current = incoming;
        pendingKindRef.current = incomingKind;
        setKind(incomingKind);
        setPeerName(incoming.peer.replace(/^cryptvora-/, ""));
        setStatus("ringing");
      });

      // The caller also opens a small control channel alongside the media
      // call (see startCall) — this is what lets "hang up" reach the other
      // person reliably. wireControlChannel is defined further down in this
      // hook, but by the time this "connection" event actually fires the
      // whole component body has already finished evaluating for this
      // render, so it's safely in scope.
      peer.on("connection", (conn) => {
        wireControlChannel(conn);
      });
    });

    return () => {
      cancelled = true;
      if (visibilityHandlerRef.current) {
        document.removeEventListener("visibilitychange", visibilityHandlerRef.current);
        window.removeEventListener("focus", visibilityHandlerRef.current);
      }
      peerRef.current?.destroy();
      peerRef.current = null;
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopConnectTimeout = () => {
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    connectTimeoutRef.current = null;
  };

  const detachIceMonitor = useCallback(() => {
    if (pcRef.current && iceHandlerRef.current) {
      pcRef.current.removeEventListener("iceconnectionstatechange", iceHandlerRef.current);
    }
    pcRef.current = null;
    iceHandlerRef.current = null;
  }, []);

  const cleanupStreams = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setPlaybackBlocked(false);
    setMediaState("connecting");
    setSpeakerOn(false);
    speakerOnRef.current = false;
    detachIceMonitor();
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
  }, [detachIceMonitor]);

  /** Best-effort — if the control channel never opened (e.g. it's still
   * negotiating, or that ICE path failed too), this just does nothing and
   * we fall back to whatever the MediaConnection itself manages to signal. */
  const sendHangupSignal = useCallback(() => {
    const conn = ctrlConnRef.current;
    if (conn?.open) {
      try {
        conn.send({ type: "hangup" });
      } catch {
        // ignore — best effort
      }
    }
  }, []);

  const endCall = useCallback(() => {
    sendHangupSignal();
    connRef.current?.close();
    connRef.current = null;
    ctrlConnRef.current?.close();
    ctrlConnRef.current = null;
    pendingCallRef.current = null;
    cleanupStreams();
    stopTimer();
    stopConnectTimeout();
    setSeconds(0);
    setStatus("idle");
    setPeerName(null);
    setMuted(false);
    setCameraOff(false);
  }, [cleanupStreams, sendHangupSignal]);

  /** Wires up the control DataConnection (either the one we opened as the
   * caller, or the one we received as the callee) so a "hangup" message
   * from the other side ends the call on our end too — this is the actual
   * fix for "I end the call but it doesn't end for my friend". */
  const wireControlChannel = useCallback(
    (conn: DataConnection) => {
      ctrlConnRef.current = conn;
      conn.on("data", (data) => {
        if (data && typeof data === "object" && (data as { type?: string }).type === "hangup") {
          endCall();
        }
      });
      conn.on("close", () => {
        if (ctrlConnRef.current === conn) ctrlConnRef.current = null;
      });
      conn.on("error", () => {
        if (ctrlConnRef.current === conn) ctrlConnRef.current = null;
      });
    },
    [endCall],
  );

  const wireConnection = useCallback(
    (call: MediaConnection, callKind: CallKind) => {
      connRef.current = call;
      call.on("stream", (stream) => {
        stopConnectTimeout();
        setRemoteStream(stream);
        setPlaybackBlocked(false);

        if (callKind === "audio") {
          // Voice calls have no <video> element to carry the audio, so this
          // standalone element is the only thing playing sound. WebViews
          // often block its autoplay() until a real tap happens — if that
          // happens, surface it as `playbackBlocked` so the UI can show a
          // "tap to enable sound" control.
          if (!remoteAudioRef.current) {
            remoteAudioRef.current = new Audio();
          }
          const audioEl = remoteAudioRef.current;
          audioEl.autoplay = true;
          audioEl.srcObject = stream;
          audioEl.play().catch(() => setPlaybackBlocked(true));
          // Voice calls default to the earpiece, like a normal phone call.
          setSpeakerOn(false);
          speakerOnRef.current = false;
          pickAudioOutputSinkId(false).then((sinkId) => applySinkId(audioEl, sinkId));
        } else if (remoteAudioRef.current) {
          // Video calls: the <video> element in the overlay carries both
          // video and audio for this same stream. Make sure the standalone
          // audio element isn't also playing it — that would double up the
          // sound (echo/robotic doubling).
          remoteAudioRef.current.pause();
          remoteAudioRef.current.srcObject = null;
          // Video calls default to the loudspeaker — nobody holds a video
          // call up to their ear.
          setSpeakerOn(true);
          speakerOnRef.current = true;
        }

        setStatus("connected");
        setSeconds(0);
        stopTimer();
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

        // `status` above just means the two devices found each other and
        // agreed to a call — it does NOT mean media packets are actually
        // flowing yet. That depends on ICE actually connecting, which can
        // silently never happen (both sides stuck at "checking"/"failed")
        // when the two networks can't reach each other directly and the
        // TURN relay doesn't work either. Watching iceConnectionState is
        // the only reliable way to know whether real audio/video is
        // getting through.
        setMediaState("connecting");
        const pc = (call as unknown as { peerConnection?: RTCPeerConnection }).peerConnection;
        if (pc) {
          detachIceMonitor();
          pcRef.current = pc;
          const onIceChange = () => {
            const iceState = pc.iceConnectionState;
            if (iceState === "connected" || iceState === "completed") {
              setMediaState("live");
            } else if (iceState === "failed" || iceState === "disconnected" || iceState === "closed") {
              setMediaState("failed");
            } else {
              setMediaState("connecting");
            }
          };
          pc.addEventListener("iceconnectionstatechange", onIceChange);
          iceHandlerRef.current = onIceChange;
          onIceChange();
        }
      });
      call.on("close", endCall);
      call.on("error", endCall);
    },
    [endCall, detachIceMonitor],
  );

  /** Re-attempt playback of the blocked remote audio. Must be called from
   * inside a real user-tap handler — WebView autoplay policies only allow
   * media to start playing as a direct result of a user gesture, not from
   * a timer or effect. */
  const retryPlayback = useCallback(() => {
    const audioEl = remoteAudioRef.current;
    if (!audioEl || !audioEl.srcObject) {
      setPlaybackBlocked(false);
      return;
    }
    audioEl
      .play()
      .then(() => setPlaybackBlocked(false))
      .catch(() => setPlaybackBlocked(true));
  }, []);

  const startCall = useCallback(
    async (remoteId: string, callKind: CallKind) => {
      const peer = peerRef.current;
      if (!peer || !connected) {
        setError("Still connecting to the calling network — wait a second and try again.");
        return;
      }
      const cleaned = remoteId.trim().toUpperCase().replace(/^CRYPTVORA-/, "");
      if (!cleaned) return;
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video:
            callKind === "video"
              ? {
                  facingMode: "user",
                  // Ask for a decent resolution/frame rate explicitly — left
                  // unset, browsers often default to something quite low
                  // (especially once a TURN relay is in the path). These are
                  // "ideal" hints, not hard requirements, so it still
                  // gracefully degrades on a weak connection instead of
                  // failing outright.
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  frameRate: { ideal: 24, max: 30 },
                }
              : false,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setKind(callKind);
        setPeerName(cleaned);
        setStatus("calling");
        const call = peer.call(`cryptvora-${cleaned}`, stream, { metadata: { kind: callKind } });
        wireConnection(call, callKind);
        // Open the dedicated hangup-signaling channel toward the same
        // device — see the comment on ctrlConnRef for why this exists.
        wireControlChannel(peer.connect(`cryptvora-${cleaned}`, { reliable: true }));
        // Best-effort — reaches the other device even if their app is fully
        // closed. If it's already open, this is redundant with the normal
        // in-app ring and simply does nothing extra.
        void sendCallPushNotification(cleaned, getOrCreateDeviceCode(), callKind);

        stopConnectTimeout();
        connectTimeoutRef.current = setTimeout(() => {
          // No "stream" event after 45s means either the other device never
          // answered (app closed and they didn't see/tap the notification in
          // time, or don't have the app open at all), or the two networks
          // couldn't establish a direct/relayed connection at all. 45s (not
          // the original 25s) to leave enough room for a push notification
          // to arrive and for them to actually open the app from it.
          setError("Couldn't reach them — make sure they have the app open and the code is right.");
          endCall();
        }, 45000);
      } catch {
        setError(
          callKind === "video"
            ? "Couldn't access the camera/microphone — check app permissions."
            : "Couldn't access the microphone — check app permissions.",
        );
        setStatus("idle");
      }
    },
    [wireConnection, wireControlChannel, connected, endCall],
  );

  const answerCall = useCallback(async () => {
    const call = pendingCallRef.current;
    if (!call) return;
    const callKind = pendingKindRef.current;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          callKind === "video"
            ? {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 24, max: 30 },
              }
            : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      call.answer(stream);
      wireConnection(call, callKind);
    } catch {
      setError(
        callKind === "video"
          ? "Couldn't access the camera/microphone — check app permissions."
          : "Couldn't access the microphone — check app permissions.",
      );
      endCall();
    }
  }, [wireConnection, endCall]);

  const declineCall = useCallback(() => {
    sendHangupSignal();
    pendingCallRef.current?.close();
    pendingCallRef.current = null;
    ctrlConnRef.current?.close();
    ctrlConnRef.current = null;
    setStatus("idle");
    setPeerName(null);
  }, [sendHangupSignal]);

  const toggleSpeaker = useCallback(() => {
    const next = !speakerOnRef.current;
    speakerOnRef.current = next;
    setSpeakerOn(next);
    // Only meaningful for audio-only calls here — for video calls the
    // <video> element lives in CallOverlay, which applies the same
    // preference to its own element via lib/audio-output.ts.
    if (kind === "audio") {
      pickAudioOutputSinkId(next).then((sinkId) => applySinkId(remoteAudioRef.current, sinkId));
    }
  }, [kind]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted((m) => !m);
  }, [muted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = cameraOff));
    setCameraOff((c) => !c);
  }, [cameraOff]);

  return (
    <CallContext.Provider
      value={{
        myCallId,
        connected,
        status,
        kind,
        peerName,
        muted,
        cameraOff,
        speakerOn,
        toggleSpeaker,
        seconds,
        error,
        localStream,
        remoteStream,
        playbackBlocked,
        mediaState,
        retryPlayback,
        startCall,
        answerCall,
        declineCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside <CallProvider>");
  return ctx;
}
