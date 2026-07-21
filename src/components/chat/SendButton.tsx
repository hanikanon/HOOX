import { motion, AnimatePresence } from "motion/react";
import { Mic, Send } from "lucide-react";

// Signature Hoox action button: hex-inspired morph between mic and send.
export function SendButton({
  mode,
  onSend,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  mode: "send" | "mic";
  onSend?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
}) {
  const isSend = mode === "send";
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      onClick={isSend ? onSend : undefined}
      onPointerDown={!isSend ? onPointerDown : undefined}
      onPointerMove={!isSend ? onPointerMove : undefined}
      onPointerUp={!isSend ? onPointerUp : undefined}
      onPointerCancel={!isSend ? onPointerCancel : undefined}
      aria-label={isSend ? "Send message" : "Hold to record"}
      className="relative flex h-12 w-12 items-center justify-center"
    >
      {/* Outer glow ring */}
      <motion.span
        className="absolute inset-0 rounded-[14px] bg-bubble-gradient opacity-70 blur-md"
        animate={{ opacity: isSend ? 0.75 : 0.45, scale: isSend ? 1.05 : 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      />
      {/* Body: rotating rounded hex feel */}
      <motion.span
        className="absolute inset-0 rounded-[14px] bg-bubble-gradient shadow-lg shadow-primary/40"
        animate={{ rotate: isSend ? 45 : 0, borderRadius: isSend ? 16 : 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      />
      {/* Inner glass */}
      <motion.span
        className="absolute inset-[3px] rounded-[12px]"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0))" }}
        animate={{ rotate: isSend ? -45 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      />
      {/* Icon */}
      <span className="relative z-10 text-primary-foreground">
        <AnimatePresence mode="wait" initial={false}>
          {isSend ? (
            <motion.span
              key="send"
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="block"
            >
              <Send className="h-[19px] w-[19px] -translate-x-[1px]" fill="currentColor" />
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="block"
            >
              <Mic className="h-[20px] w-[20px]" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {/* Pulse when mic */}
      {!isSend && (
        <motion.span
          className="absolute inset-0 rounded-[18px] ring-1 ring-primary/40"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </motion.button>
  );
}
