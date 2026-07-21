import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SettingGroup({
  label,
  children,
  delay = 0,
}: {
  label?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="mb-5"
    >
      {label ? (
        <h3 className="px-5 pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
          {label}
        </h3>
      ) : null}
      <div className="mx-3 overflow-hidden rounded-2xl border border-border bg-surface/80">
        {children}
      </div>
    </motion.section>
  );
}
