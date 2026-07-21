import { motion } from "framer-motion";
import { QrCode, Pencil, BadgeCheck } from "lucide-react";
import { BADGES, useSettings } from "./SettingsContext";

export function ProfileHeader({
  status = "Trading BTC/USDT",
  onAvatarClick,
  onEditClick,
  onQrClick,
}: {
  status?: string;
  onAvatarClick?: () => void;
  onEditClick?: () => void;
  onQrClick?: () => void;
}) {
  const { profile } = useSettings();
  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const badge = BADGES.find((b) => b.id === profile.badge) ?? null;
  const showBadge = badge && badge.id !== "none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="mx-3 mb-5"
    >
      <div
        className="relative overflow-hidden rounded-[22px] border border-border"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--primary) 10%, var(--surface)) 0%, var(--surface) 62%)",
          boxShadow:
            "0 1px 0 color-mix(in oklab, var(--foreground) 6%, transparent) inset, 0 8px 24px -18px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* subtle accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--primary)" }}
        />

        <div className="relative flex items-center gap-4 px-4 py-4">
          {/* Avatar */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onAvatarClick}
            className="relative shrink-0"
            aria-label="Open profile photo"
          >
            <div
              className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full text-[18px] font-semibold text-white"
              style={{
                background: profile.avatarColor,
                boxShadow:
                  "0 0 0 2px var(--surface), 0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent), 0 6px 16px -6px color-mix(in oklab, var(--primary) 45%, transparent)",
              }}
            >
              {initials}
            </div>
            {profile.online && (
              <span
                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full"
                style={{
                  background: "var(--success)",
                  boxShadow: "0 0 0 2.5px var(--surface)",
                }}
              />
            )}
          </motion.button>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
                {profile.displayName}
              </h2>
              {showBadge && (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${badge!.from}, ${badge!.to})`,
                    boxShadow: `0 4px 10px -6px ${badge!.from}`,
                  }}
                  title={badge!.description}
                >
                  <BadgeCheck size={10} strokeWidth={2.8} /> {badge!.label}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-[13px] leading-tight text-muted-foreground">
              @{profile.username}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              {profile.online && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--success)" }}
                />
              )}
              <span className="truncate text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {profile.online ? "Online" : "Away"} · {status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onEditClick}
              aria-label="Edit profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_9%,transparent)]"
            >
              <Pencil size={15} strokeWidth={2.2} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onQrClick}
              aria-label="QR code"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--primary)] transition-colors"
              style={{
                background: "var(--primary-soft)",
                border: "1px solid color-mix(in oklab, var(--primary) 22%, transparent)",
              }}
            >
              <QrCode size={15} strokeWidth={2.2} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
