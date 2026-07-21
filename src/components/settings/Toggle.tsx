import { motion } from "framer-motion";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors"
      style={{
        background: checked
          ? "var(--primary)"
          : "color-mix(in oklab, var(--foreground) 14%, transparent)",
        boxShadow: checked
          ? "0 6px 18px -6px color-mix(in oklab, var(--primary) 60%, transparent), inset 0 1px 0 color-mix(in oklab, white 18%, transparent)"
          : "inset 0 1px 0 color-mix(in oklab, white 4%, transparent)",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 34 }}
        className="ml-0.5 block h-[22px] w-[22px] rounded-full bg-white shadow-md"
        style={{ marginLeft: checked ? 20 : 2 }}
      />
    </button>
  );
}
