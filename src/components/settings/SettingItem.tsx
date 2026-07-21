import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type IconType = ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;

type BaseProps = {
  icon: IconType;
  label: string;
  description?: string;
  tint?: string; // token color, e.g. "primary", "success", "destructive"
  trailing?: ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  last?: boolean;
};

export function SettingItem({
  icon: Icon,
  label,
  description,
  tint = "primary",
  trailing,
  onClick,
  showArrow = true,
  danger,
  last,
}: BaseProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={[
        "group flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors",
        "hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]",
        !last ? "border-b border-border" : "",
      ].join(" ")}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: danger
            ? "color-mix(in oklab, var(--destructive) 14%, transparent)"
            : `color-mix(in oklab, var(--${tint}) 14%, transparent)`,
          color: danger ? "var(--destructive)" : `var(--${tint})`,
        }}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`truncate text-[15px] font-medium leading-tight ${
            danger ? "text-destructive" : "text-foreground"
          }`}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {description}
          </span>
        ) : null}
      </div>
      {trailing ? (
        <span className="ml-2 shrink-0 text-[13px] text-muted-foreground">{trailing}</span>
      ) : null}
      {showArrow && !trailing ? (
        <ChevronRight
          size={18}
          className="shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
        />
      ) : null}
    </motion.button>
  );
}
