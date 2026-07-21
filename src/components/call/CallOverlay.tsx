import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, PlayCircle, Volume2, Volume1 } from "lucide-react";
import { OwlMark } from "@/components/logo";
import { useCall } from "@/hooks/use-call";
import { CallRing } from "./CallRing";
import { pickAudioOutputSinkId, applySinkId } from "@/lib/audio-output";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Mounted once near the app root — so a call can ring in even while the
 * person is browsing feed, settings, anywhere. Renders nothing when idle. */
export function CallOverlay() {
  const {
    status,
    kind,
    peerName,
    seconds,
    muted,
    cameraOff,
    speakerOn,
    localStream,
    remoteStream,
    playbackBlocked,
    mediaState,
    retryPlayback,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // For video calls, this <video> element carries the audio too — so if the
  // WebView blocks its autoplay, both picture and sound are stuck until a
  // real tap unblocks them. Tracked separately from the hook's
  // `playbackBlocked` (which only concerns the audio-only path).
  const [videoNeedsTap, setVideoNeedsTap] = useState(false);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el) return;
    el.srcObject = remoteStream;
    if (remoteStream) {
      el
        .play()
        .then(() => setVideoNeedsTap(false))
        .catch(() => setVideoNeedsTap(true));
    } else {
      setVideoNeedsTap(false);
    }
  }, [remoteStream]);

  // The hook manages speaker routing for audio-only calls (it owns the
  // standalone <audio> element). For video calls, this <video> element is
  // the one actually carrying sound, so it's applied here instead.
  useEffect(() => {
    if (kind !== "video") return;
    pickAudioOutputSinkId(speakerOn).then((sinkId) => applySinkId(remoteVideoRef.current, sinkId));
  }, [kind, speakerOn, remoteStream]);

  if (status === "idle") return null;

  const isVideo = kind === "video";
  const showRemoteVideo = isVideo && status === "connected" && remoteStream;
  const showPlaybackPrompt =
    status === "connected" && (isVideo ? videoNeedsTap : playbackBlocked);
  const isRinging = status === "ringing";
  const isDialing = status === "calling";

  const enablePlayback = () => {
    const el = remoteVideoRef.current;
    if (el) {
      el
        .play()
        .then(() => setVideoNeedsTap(false))
        .catch(() => setVideoNeedsTap(true));
    }
    retryPlayback();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="call-overlay"
        className="fixed inset-0 z-[60] flex flex-col items-center justify-between overflow-hidden px-6 pb-12 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {/* Brand gradient background — this is the call screen's own look,
         * independent of the person's chosen app theme (same idea as most
         * calling apps: a fixed, immersive backdrop for calls). Hidden once
         * a video call's remote feed takes over the screen. */}
        {!showRemoteVideo && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#5B94F0] via-[#6C63E7] to-[#4A1FA8]" />
        )}

        {/* Full-bleed remote video, once the video call is actually connected */}
        {showRemoteVideo && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {showRemoteVideo && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60" />}

        {/* WebView autoplay policies sometimes block the remote stream
         * from starting on its own — this gives the person an explicit,
         * reliable way to start it with one tap instead of relying on the
         * browser's own (often invisible-in-WebView) native prompt. */}
        {showPlaybackPrompt && (
          <button
            type="button"
            onClick={enablePlayback}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 text-white"
          >
            <PlayCircle className="size-14" />
            <span className="text-sm font-medium">
              Tap to enable {isVideo ? "video & sound" : "sound"}
            </span>
          </button>
        )}

        {/* Your own camera preview, picture-in-picture, only for video calls */}
        {isVideo && localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute right-4 top-16 z-10 h-40 w-28 rounded-2xl border border-white/20 object-cover shadow-lg [transform:scaleX(-1)]"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {!showRemoteVideo && (
            <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
              <CallRing size={128} spinning={isRinging || isDialing} glowing={status === "connected"} />
              <OwlMark size={92} className="ring-2 ring-white/40" />
            </div>
          )}
          <div>
            <p className="text-xl font-semibold tracking-tight text-white">{peerName ?? "Unknown"}</p>
            <p className="mt-1 text-sm text-white/70">
              {isRinging && (isVideo ? "Incoming video call…" : "Incoming call…")}
              {isDialing && (isVideo ? "Video calling…" : "Calling…")}
              {status === "connected" && formatDuration(seconds)}
            </p>
            {status === "connected" && mediaState !== "live" && (
              <p
                className={`mt-1 text-[11px] ${mediaState === "failed" ? "text-red-300" : "text-amber-300"}`}
              >
                {mediaState === "failed"
                  ? "Connection trouble — audio/video may not come through"
                  : "Connecting audio/video…"}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-5">
          {isRinging ? (
            <>
              <CallButton onClick={declineCall} tone="danger" icon={<PhoneOff className="size-6" />} label="Decline" />
              <CallButton
                onClick={answerCall}
                tone="accept"
                icon={isVideo ? <Video className="size-6" /> : <Phone className="size-6" />}
                label="Accept"
              />
            </>
          ) : (
            <>
              <CallButton
                onClick={toggleMute}
                tone="glass"
                active={muted}
                icon={muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                label={muted ? "Unmute" : "Mute"}
              />
              <CallButton
                onClick={toggleSpeaker}
                tone="glass"
                active={speakerOn}
                icon={speakerOn ? <Volume2 className="size-5" /> : <Volume1 className="size-5" />}
                label="Speaker"
              />
              {isVideo && (
                <CallButton
                  onClick={toggleCamera}
                  tone="glass"
                  active={cameraOff}
                  icon={cameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
                  label={cameraOff ? "Camera on" : "Camera off"}
                />
              )}
              <CallButton onClick={endCall} tone="danger" icon={<PhoneOff className="size-6" />} label="End" />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function CallButton({
  onClick,
  icon,
  label,
  tone,
  active,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "accept" | "danger" | "glass";
  active?: boolean;
}) {
  const toneClass =
    tone === "accept"
      ? "bg-emerald-500 text-white shadow-emerald-900/40"
      : tone === "danger"
        ? "bg-red-500 text-white shadow-red-900/40"
        : active
          ? "bg-white text-[#4A1FA8] shadow-black/20"
          : "bg-white/15 text-white backdrop-blur-md border border-white/25 shadow-black/10";
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        className={`grid size-16 place-items-center rounded-full shadow-lg ${toneClass}`}
      >
        {icon}
      </motion.button>
      <span className="text-[11px] text-white/80">{label}</span>
    </div>
  );
}
