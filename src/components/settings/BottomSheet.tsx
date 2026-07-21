import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
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
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
            }}
            className="relative z-10 w-full max-w-[520px] rounded-t-[20px] border-t border-border bg-surface pb-5 pt-1.5 md:max-w-[560px]"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
              boxShadow: "0 -12px 40px -18px rgba(0,0,0,0.45)",
            }}
          >
            <div className="mx-auto mb-1 h-1 w-9 rounded-full bg-[color-mix(in_oklab,var(--foreground)_18%,transparent)]" />
            {title && (
              <h3 className="px-5 pb-2 pt-2 text-center text-[14px] font-semibold text-foreground">
                {title}
              </h3>
            )}
            <div className="px-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SheetItem({
  icon: Icon,
  label,
  description,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${danger ? "text-destructive" : "text-foreground/80"}`}
        style={{
          background: danger
            ? "color-mix(in oklab, var(--destructive) 12%, transparent)"
            : "color-mix(in oklab, var(--foreground) 6%, transparent)",
        }}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[14.5px] font-medium ${
            danger ? "text-destructive" : "text-foreground"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="truncate text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
    </motion.button>
  );
}
