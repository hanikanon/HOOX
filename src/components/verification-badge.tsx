import {
  BadgeCheck,
  ShieldCheck,
  Crown,
  Sparkles,
  GraduationCap,
  TrendingUp,
  LineChart,
  Compass,
  Users,
  MessagesSquare,
  Terminal,
  Handshake,
  Megaphone,
  Star,
  Flame,
  Gem,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hoox verification & achievement badge system.
 *
 * Each tier has a unique glyph, gradient utility (defined in styles.css) and
 * prestige weight. Rendered as a tiny gem-like chip that sits inline next to a
 * display name. Legendary & Premium Verified animate a slow shimmer.
 *
 * Add new tiers by extending BADGES + declaring a `badge-<name>` utility in
 * styles.css — no other component needs to change.
 */

export type BadgeTier =
  | "official"
  | "verified"
  | "premium"
  | "premium-verified"
  | "creator"
  | "educator"
  | "trader"
  | "analyst"
  | "mentor"
  | "leader"
  | "contributor"
  | "developer"
  | "partner"
  | "ambassador"
  | "elite"
  | "legendary"
  | "founding";

interface BadgeDef {
  icon: LucideIcon;
  cls: string;
  label: string;
  shimmer?: boolean;
}

const BADGES: Record<BadgeTier, BadgeDef> = {
  official: { icon: ShieldCheck, cls: "badge-official", label: "Official" },
  verified: { icon: BadgeCheck, cls: "badge-verified", label: "Verified" },
  premium: { icon: Crown, cls: "badge-premium", label: "Premium" },
  "premium-verified": {
    icon: Sparkles,
    cls: "badge-premium-verified",
    label: "Premium Verified",
    shimmer: true,
  },
  creator: { icon: Sparkles, cls: "badge-creator", label: "Creator" },
  educator: { icon: GraduationCap, cls: "badge-educator", label: "Educator" },
  trader: { icon: TrendingUp, cls: "badge-trader", label: "Top Trader" },
  analyst: { icon: LineChart, cls: "badge-analyst", label: "Analyst" },
  mentor: { icon: Compass, cls: "badge-mentor", label: "Mentor" },
  leader: { icon: Users, cls: "badge-leader", label: "Community Leader" },
  contributor: {
    icon: MessagesSquare,
    cls: "badge-contributor",
    label: "Contributor",
  },
  developer: { icon: Terminal, cls: "badge-developer", label: "Developer" },
  partner: { icon: Handshake, cls: "badge-partner", label: "Partner" },
  ambassador: { icon: Megaphone, cls: "badge-ambassador", label: "Ambassador" },
  elite: { icon: Star, cls: "badge-elite", label: "Elite" },
  legendary: {
    icon: Flame,
    cls: "badge-legendary",
    label: "Legendary",
    shimmer: true,
  },
  founding: { icon: Rocket, cls: "badge-founding", label: "Founding Member" },
};

interface VerificationBadgeProps {
  tier?: BadgeTier | null;
  size?: number;
  className?: string;
  title?: string;
}

export function VerificationBadge({
  tier,
  size = 14,
  className,
  title,
}: VerificationBadgeProps) {
  if (!tier) return null;
  const def = BADGES[tier];
  if (!def) return null;
  const Icon = def.icon;
  const padding = Math.max(2, Math.round(size * 0.18));
  const iconSize = size;
  return (
    <span
      role="img"
      aria-label={def.label}
      title={title ?? def.label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        def.cls,
        def.shimmer && "animate-badge-shine",
        className,
      )}
      style={{
        padding,
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.25) inset, 0 2px 8px -2px rgba(0,0,0,0.35)",
      }}
    >
      <Icon
        strokeWidth={2.5}
        style={{ width: iconSize, height: iconSize }}
        aria-hidden
      />
    </span>
  );
}

/**
 * Bigger chip variant with label — for profile headers, badge showcases.
 */
export function VerificationBadgeChip({
  tier,
  className,
}: {
  tier: BadgeTier;
  className?: string;
}) {
  const def = BADGES[tier];
  const Icon = def.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        def.cls,
        def.shimmer && "animate-badge-shine",
        className,
      )}
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.22) inset, 0 4px 14px -4px rgba(0,0,0,0.4)",
      }}
    >
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
      {def.label}
    </span>
  );
}

export const ALL_BADGES = Object.keys(BADGES) as BadgeTier[];
export const BADGE_META = BADGES;
