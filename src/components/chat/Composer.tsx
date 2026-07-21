import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Paperclip, Smile, Trash2, X } from "lucide-react";
import { haptic, sfx } from "@/lib/sfx";
import { SendButton } from "./SendButton";
import { AttachmentSheet, type PickedAttachment } from "./AttachmentSheet";


export function Composer({
  onSend, onVoice, onAttachments,
  editing, onCancelEdit, onCommitEdit,
  replyTo, onCancelReply,
}: {
  onSend: (text: string) => void;
  onVoice: (durationSec: number) => void;
  onAttachments: (items: PickedAttachment[], caption?: string) => void;
  editing?: { id: string; text: string } | null;
  onCancelEdit?: () => void;
  onCommitEdit?: (text: string) => void;
  replyTo?: { name: string; text: string } | null;
  onCancelReply?: () => void;
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  
  const [elapsed, setElapsed] = useState(0);
  const [slide, setSlide] = useState(0);
  const [sheet, setSheet] = useState(false);
  const startRef = useRef(0);
  const startXRef = useRef(0);
  const cancelledRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) setText(editing.text); }, [editing]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(140, ta.scrollHeight) + "px";
  }, [text]);

  const trimmed = text.trim();
  const hasText = trimmed.length > 0;

  const send = () => {
    if (!hasText) return;
    if (editing) { onCommitEdit?.(trimmed); }
    else { onSend(trimmed); haptic(6); }
    setText("");
  };

  const beginRecord = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    cancelledRef.current = false;
    startRef.current = performance.now();
    startXRef.current = e.clientX;
    setSlide(0); setElapsed(0); setRecording(true);
    haptic(14);
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((performance.now() - startRef.current) / 1000));
    }, 200);
  };
  const moveRecord = (e: React.PointerEvent) => {
    if (!recording) return;
    const dx = Math.min(0, e.clientX - startXRef.current);
    setSlide(dx);
    if (dx < -110 && !cancelledRef.current) { cancelledRef.current = true; haptic(22); }
  };
  const endRecord = () => {
    if (!recording) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const dur = Math.max(1, Math.floor((performance.now() - startRef.current) / 1000));
    const cancelled = cancelledRef.current;
    setRecording(false); setSlide(0);
    if (cancelled) { sfx.cancel(); haptic(16); return; }
    // Native behavior: releasing sends the voice message immediately.
    haptic(8);
    onVoice(dur);
  };


  const mmss = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <>
      <div className="sticky bottom-0 z-20 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        <div className="pill-bar gpu px-2 py-2">
        {(replyTo || editing) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-primary bg-surface-elevated/70 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold text-primary">
                {editing ? "Editing message" : `Reply to ${replyTo?.name}`}
              </div>
              <div className="truncate text-[12.5px] text-foreground/80">
                {editing ? editing.text : replyTo?.text}
              </div>
            </div>
            <button
              onClick={() => { editing ? onCancelEdit?.() : onCancelReply?.(); setText(""); }}
              className="tap active:tap-active flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/5"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {recording ? (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-3 rounded-full bg-surface-elevated px-3 py-2"
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_12px] shadow-destructive/70"
              />
              <span className="tabular-nums text-[13px] font-medium text-foreground/90">{mmss}</span>
              <div className="flex flex-1 items-center gap-[3px] overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [6, 10 + ((i * 7) % 16), 6] }}
                    transition={{ duration: 0.7 + (i % 5) * 0.05, repeat: Infinity, ease: "easeInOut" }}
                    style={{ height: 6 }}
                  />
                ))}
              </div>
              <motion.div
                animate={{ x: slide, opacity: cancelledRef.current ? 0.5 : 1 }}
                className="flex items-center gap-1 text-[12px] text-muted-foreground"
              >
                {cancelledRef.current ? (
                  <span className="flex items-center gap-1 text-destructive"><Trash2 className="h-3.5 w-3.5" /> Release to cancel</span>
                ) : (
                  <><span>◀</span><span>slide to cancel</span></>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="flex items-end gap-2"
            >
              <button
                aria-label="Attach"
                onClick={() => { sfx.tap(); haptic(6); setSheet(true); }}
                className="tap active:tap-active flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5"
              >
                <Paperclip className="h-[19px] w-[19px]" />
              </button>

              <div className="flex flex-1 items-end gap-1 rounded-[22px] bg-surface-elevated px-2 py-1.5 ring-1 ring-white/5 focus-within:ring-primary/40 transition">
                <textarea
                  ref={taRef}
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={editing ? "Edit message" : "Message"}
                  className="scroll-fade min-h-[28px] max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1 text-[15px] leading-snug outline-none placeholder:text-muted-foreground"
                />
                <button
                  aria-label="Emoji"
                  onClick={() => sfx.tap()}
                  className="tap active:tap-active flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5"
                >
                  <Smile className="h-[19px] w-[19px]" />
                </button>
              </div>

              <SendButton
                mode={hasText ? "send" : "mic"}
                onSend={send}
                onPointerDown={beginRecord}
                onPointerMove={moveRecord}
                onPointerUp={endRecord}
                onPointerCancel={endRecord}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <AttachmentSheet
        open={sheet}
        onClose={() => setSheet(false)}
        onPicked={(items) => onAttachments(items)}
      />
    </>
  );
}
