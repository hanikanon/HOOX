import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * A native-feeling bottom sheet: backdrop fade, spring-driven slide up, and
 * genuine drag-to-dismiss (flick down fast, or drag past ~100px, to close).
 * Ported from Hoox's reference animation system — kept deliberately
 * light: only `transform`/`opacity` ever animate, so it stays GPU-composited
 * and cheap even on mid-range Android.
 *
 * Rendered through a portal into document.body. Route screens are wrapped in
 * Framer Motion containers that keep a CSS transform applied even at rest
 * (that's how the page-slide transitions work) — and a CSS transform on any
 * ancestor turns `position: fixed` into something scoped to that ancestor
 * instead of the real screen. Portalling out of that tree is what keeps this
 * sheet full-screen and interactive no matter where it's opened from.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.9 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={onDragEnd}
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
              boxShadow: "0 -12px 40px -18px rgba(0,0,0,0.5)",
              willChange: "transform",
            }}
            className="relative z-10 w-full max-w-[520px] rounded-t-[20px] border-t border-border bg-surface pb-2 pt-1.5 lg:max-w-[400px] lg:rounded-[20px] lg:border"
          >
            <div className="mx-auto mb-1 h-1 w-9 shrink-0 rounded-full bg-[color-mix(in_oklab,var(--foreground)_18%,transparent)] lg:hidden" />
            {title && (
              <h3 className="px-5 pb-2 pt-2 text-center text-[14px] font-semibold text-foreground">
                {title}
              </h3>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
