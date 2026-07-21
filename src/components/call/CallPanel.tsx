import { useState } from "react";
import { Phone, Video, Copy, Check, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BottomSheet } from "@/components/bottom-sheet";
import { useCall } from "@/hooks/use-call";

/**
 * Opened from the phone/video icons in a conversation header. This is the
 * one place both directions of "who calls whom" happen:
 *  - Your own code is shown large, with a copy button — send it to a friend
 *    so *they* can call *you*.
 *  - The input below is where you type *their* code, then choose voice or
 *    video, to call *them*.
 * No phone numbers, no account system — just a random per-device code
 * (like a Zoom meeting ID), generated once and reused every time.
 */
export function CallPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { myCallId, connected, startCall, error } = useCall();
  const [remoteCode, setRemoteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!myCallId) return;
    try {
      await navigator.clipboard.writeText(myCallId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable in some WebView contexts — the
      // code is still visible on screen to copy by hand.
    }
  };

  const call = (kind: "audio" | "video") => {
    if (!remoteCode.trim()) return;
    startCall(remoteCode, kind);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Call">
      <div className="space-y-5 px-1 pb-2">
        <div className="rounded-2xl border border-border bg-surface/60 p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${connected ? "bg-emerald-400" : "animate-pulse bg-amber-400"}`}
            />
            <p className="text-[11px] text-muted-foreground">
              {connected ? "Ready to call" : "Connecting…"}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">Your call code — share it so a friend can call you</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-2xl font-semibold tracking-[0.2em]">{myCallId ?? "…"}</span>
            <button
              type="button"
              onClick={copyCode}
              disabled={!myCallId}
              className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Copy code"
            >
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] text-muted-foreground">Or enter a friend's code to call them</label>
          <input
            value={remoteCode}
            onChange={(e) => setRemoteCode(e.target.value.toUpperCase())}
            placeholder="e.g. F3K9QZ"
            maxLength={6}
            className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-center text-lg font-semibold tracking-[0.15em] outline-none focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/40"
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => call("audio")}
              disabled={!remoteCode.trim() || !connected}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white/10 py-3 text-xs font-semibold text-foreground disabled:opacity-40"
            >
              <Phone className="size-4" />
              Voice
            </button>
            <button
              type="button"
              onClick={() => call("video")}
              disabled={!remoteCode.trim() || !connected}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Video className="size-4" />
              Video
            </button>
            <Link
              to="/dm/$code"
              params={{ code: remoteCode.trim().toUpperCase() }}
              onClick={(e) => {
                if (!remoteCode.trim()) e.preventDefault();
                else onClose();
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-white/10 py-3 text-xs font-semibold text-foreground ${!remoteCode.trim() ? "pointer-events-none opacity-40" : ""}`}
            >
              <MessageCircle className="size-4" />
              Message
            </Link>
          </div>
        </div>

        {error && <p className="text-center text-[12px] text-red-400">{error}</p>}
      </div>
    </BottomSheet>
  );
}
