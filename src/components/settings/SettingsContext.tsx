import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ThemeId =
  | "dark"
  | "amoled"
  | "light"
  | "midnight"
  | "purple"
  | "emerald"
  | "ocean"
  | "sunset"
  | "rose"
  | "matrix"
  | "cyber";

export type AccentId = "violet" | "blue" | "emerald" | "rose" | "amber" | "cyan" | "pink";
export type BubbleStyle = "rounded" | "modern" | "square" | "tail";
export type FontSize = "small" | "medium" | "large" | "xl";
export type Motion = "normal" | "fast" | "reduced";
export type AppIcon = "aurora" | "midnight" | "prism" | "mono";
export type WallpaperId = "aurora" | "nebula" | "ocean" | "sunset" | "graphite" | "mesh";

export type SocialPlatform =
  | "telegram"
  | "twitter"
  | "discord"
  | "tradingview"
  | "youtube"
  | "github"
  | "linkedin"
  | "instagram";

export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export type BadgeId =
  | "none"
  | "official"
  | "verified"
  | "premium"
  | "creator"
  | "analyst"
  | "educator"
  | "partner"
  | "top-trader";

export type BadgeDef = {
  id: BadgeId;
  label: string;
  from: string;
  to: string;
  description: string;
};

export const BADGES: BadgeDef[] = [
  { id: "none", label: "No badge", from: "#64748b", to: "#475569", description: "Hide badge on profile" },
  { id: "official", label: "Official", from: "#3b82f6", to: "#0ea5e9", description: "Official Hoox account" },
  { id: "verified", label: "Verified", from: "#a855f7", to: "#7c3aed", description: "Identity verified" },
  { id: "premium", label: "Premium", from: "#f59e0b", to: "#d97706", description: "Premium member" },
  { id: "creator", label: "Creator", from: "#ec4899", to: "#a855f7", description: "Content creator" },
  { id: "analyst", label: "Analyst", from: "#22d3ee", to: "#0891b2", description: "Certified market analyst" },
  { id: "educator", label: "Educator", from: "#84cc16", to: "#16a34a", description: "Trading educator" },
  { id: "partner", label: "Partner", from: "#eab308", to: "#f59e0b", description: "Hoox partner" },
  { id: "top-trader", label: "Top Trader", from: "#10b981", to: "#059669", description: "Ranked top trader" },
];

export type Profile = {
  displayName: string;
  username: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  birthday: string;
  location: string;
  avatarColor: string;
  coverGradient: string;
  verified: boolean;
  online: boolean;
  cryptoId: string;
  walletAddress: string;
  walletChain: string;
  socials: SocialLinks;
  badge: BadgeId;
  availableBadges: BadgeId[];
};

/* ---------- Social URL helpers ---------- */

const SOCIAL_HOSTS: Record<SocialPlatform, RegExp> = {
  telegram: /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]{3,})\/?$/i,
  twitter: /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})\/?$/i,
  discord: /^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|discord\.com\/users)\/([a-zA-Z0-9_.-]+)\/?$/i,
  tradingview: /^(?:https?:\/\/)?(?:www\.)?tradingview\.com\/u\/([a-zA-Z0-9_]+)\/?$/i,
  youtube: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@([a-zA-Z0-9_.-]+)|c\/([a-zA-Z0-9_.-]+)|channel\/([a-zA-Z0-9_-]+))\/?$/i,
  github: /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]{1,39})\/?$/i,
  linkedin: /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?$/i,
  instagram: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]{1,30})\/?$/i,
};

export function extractSocialUsername(
  platform: SocialPlatform,
  url: string,
): string | null {
  const m = url.trim().match(SOCIAL_HOSTS[platform]);
  if (!m) return null;
  return m[1] || m[2] || m[3] || null;
}

export function isValidSocialUrl(platform: SocialPlatform, url: string) {
  if (!url.trim()) return true; // empty = ok
  return extractSocialUsername(platform, url) !== null;
}

type Ctx = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  accent: AccentId;
  setAccent: (a: AccentId) => void;
  bubble: BubbleStyle;
  setBubble: (b: BubbleStyle) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
  radius: number; // 6-28
  setRadius: (n: number) => void;
  motion: Motion;
  setMotion: (m: Motion) => void;
  appIcon: AppIcon;
  setAppIcon: (a: AppIcon) => void;
  wallpaper: WallpaperId;
  setWallpaper: (w: WallpaperId) => void;
  blur: number; // 0-32
  setBlur: (n: number) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const SettingsCtx = createContext<Ctx | null>(null);

export const ACCENTS: Record<AccentId, { label: string; value: string; glow: string; soft: string }> = {
  violet: { label: "Violet", value: "oklch(0.7 0.18 300)", glow: "oklch(0.82 0.14 300)", soft: "oklch(0.7 0.18 300 / 0.14)" },
  blue: { label: "Azure", value: "oklch(0.68 0.16 250)", glow: "oklch(0.8 0.13 250)", soft: "oklch(0.68 0.16 250 / 0.14)" },
  emerald: { label: "Emerald", value: "oklch(0.72 0.17 155)", glow: "oklch(0.82 0.14 155)", soft: "oklch(0.72 0.17 155 / 0.14)" },
  rose: { label: "Rose", value: "oklch(0.68 0.2 15)", glow: "oklch(0.8 0.15 15)", soft: "oklch(0.68 0.2 15 / 0.14)" },
  amber: { label: "Amber", value: "oklch(0.78 0.16 70)", glow: "oklch(0.88 0.13 70)", soft: "oklch(0.78 0.16 70 / 0.14)" },
  cyan: { label: "Cyan", value: "oklch(0.75 0.13 210)", glow: "oklch(0.85 0.11 210)", soft: "oklch(0.75 0.13 210 / 0.14)" },
  pink: { label: "Pink", value: "oklch(0.74 0.18 340)", glow: "oklch(0.84 0.14 340)", soft: "oklch(0.74 0.18 340 / 0.14)" },
};

export const THEMES: Record<
  ThemeId,
  { label: string; bg: string; surface: string; surface2: string; fg: string; muted: string; border: string; wallpaper: string; scheme: "dark" | "light" }
> = {
  dark: {
    label: "Dark",
    bg: "oklch(0.11 0.006 280)",
    surface: "oklch(0.145 0.007 280)",
    surface2: "oklch(0.18 0.008 280)",
    fg: "oklch(0.98 0.003 90)",
    muted: "oklch(0.66 0.012 280)",
    border: "oklch(1 0 0 / 0.07)",
    wallpaper:
      "radial-gradient(1200px 700px at 12% -10%, oklch(0.3 0.09 300 / 0.18), transparent 60%), radial-gradient(900px 600px at 100% 0%, oklch(0.3 0.05 250 / 0.14), transparent 55%)",
    scheme: "dark",
  },
  amoled: {
    label: "AMOLED",
    bg: "oklch(0 0 0)",
    surface: "oklch(0.05 0 0)",
    surface2: "oklch(0.09 0 0)",
    fg: "oklch(0.98 0 0)",
    muted: "oklch(0.6 0 0)",
    border: "oklch(1 0 0 / 0.08)",
    wallpaper: "radial-gradient(1000px 700px at 20% -10%, oklch(0.2 0.12 300 / 0.25), transparent 60%)",
    scheme: "dark",
  },
  light: {
    label: "Light",
    bg: "oklch(0.985 0.003 90)",
    surface: "oklch(1 0 0)",
    surface2: "oklch(0.975 0.004 90)",
    fg: "oklch(0.19 0.01 280)",
    muted: "oklch(0.5 0.012 280)",
    border: "oklch(0.2 0.01 280 / 0.08)",
    wallpaper:
      "radial-gradient(1000px 600px at 10% -10%, oklch(0.85 0.09 300 / 0.35), transparent 60%), radial-gradient(800px 500px at 100% 10%, oklch(0.88 0.07 250 / 0.3), transparent 55%)",
    scheme: "light",
  },
  midnight: {
    label: "Midnight",
    bg: "oklch(0.09 0.02 260)",
    surface: "oklch(0.13 0.025 260)",
    surface2: "oklch(0.17 0.03 260)",
    fg: "oklch(0.97 0.005 250)",
    muted: "oklch(0.65 0.02 250)",
    border: "oklch(0.8 0.1 250 / 0.1)",
    wallpaper:
      "radial-gradient(1000px 700px at 20% -10%, oklch(0.35 0.15 260 / 0.28), transparent 60%), radial-gradient(700px 500px at 90% 10%, oklch(0.3 0.12 220 / 0.22), transparent 55%)",
    scheme: "dark",
  },
  purple: {
    label: "Purple",
    bg: "oklch(0.1 0.03 305)",
    surface: "oklch(0.14 0.04 305)",
    surface2: "oklch(0.18 0.05 305)",
    fg: "oklch(0.98 0.005 300)",
    muted: "oklch(0.68 0.03 300)",
    border: "oklch(0.85 0.1 300 / 0.12)",
    wallpaper:
      "radial-gradient(1200px 700px at 10% -10%, oklch(0.35 0.2 305 / 0.35), transparent 60%), radial-gradient(800px 600px at 100% 20%, oklch(0.32 0.18 330 / 0.25), transparent 60%)",
    scheme: "dark",
  },
  emerald: {
    label: "Emerald",
    bg: "oklch(0.1 0.02 160)",
    surface: "oklch(0.14 0.03 160)",
    surface2: "oklch(0.18 0.035 160)",
    fg: "oklch(0.98 0.005 155)",
    muted: "oklch(0.66 0.03 160)",
    border: "oklch(0.8 0.1 160 / 0.12)",
    wallpaper:
      "radial-gradient(1200px 700px at 10% -10%, oklch(0.35 0.18 160 / 0.3), transparent 60%), radial-gradient(800px 600px at 100% 20%, oklch(0.3 0.14 190 / 0.22), transparent 60%)",
    scheme: "dark",
  },
  ocean: {
    label: "Ocean",
    bg: "oklch(0.1 0.025 235)",
    surface: "oklch(0.14 0.03 235)",
    surface2: "oklch(0.18 0.035 235)",
    fg: "oklch(0.98 0.005 230)",
    muted: "oklch(0.66 0.03 230)",
    border: "oklch(0.8 0.1 230 / 0.12)",
    wallpaper:
      "radial-gradient(1200px 700px at 10% -10%, oklch(0.35 0.18 235 / 0.32), transparent 60%), radial-gradient(800px 600px at 100% 20%, oklch(0.32 0.14 200 / 0.25), transparent 60%)",
    scheme: "dark",
  },
  sunset: {
    label: "Sunset",
    bg: "oklch(0.12 0.03 30)",
    surface: "oklch(0.16 0.035 30)",
    surface2: "oklch(0.2 0.04 30)",
    fg: "oklch(0.98 0.005 60)",
    muted: "oklch(0.68 0.03 40)",
    border: "oklch(0.9 0.1 40 / 0.12)",
    wallpaper:
      "radial-gradient(1200px 700px at 10% -10%, oklch(0.4 0.18 30 / 0.35), transparent 60%), radial-gradient(800px 600px at 100% 20%, oklch(0.38 0.16 350 / 0.28), transparent 60%)",
    scheme: "dark",
  },
  rose: {
    label: "Rose",
    bg: "oklch(0.11 0.03 15)",
    surface: "oklch(0.15 0.035 15)",
    surface2: "oklch(0.19 0.04 15)",
    fg: "oklch(0.98 0.005 20)",
    muted: "oklch(0.68 0.03 15)",
    border: "oklch(0.9 0.1 15 / 0.12)",
    wallpaper:
      "radial-gradient(1200px 700px at 10% -10%, oklch(0.42 0.2 15 / 0.35), transparent 60%), radial-gradient(800px 600px at 100% 20%, oklch(0.38 0.16 340 / 0.28), transparent 60%)",
    scheme: "dark",
  },
  matrix: {
    label: "Matrix",
    bg: "oklch(0.08 0.02 155)",
    surface: "oklch(0.12 0.03 155)",
    surface2: "oklch(0.16 0.04 155)",
    fg: "oklch(0.95 0.15 155)",
    muted: "oklch(0.62 0.1 155)",
    border: "oklch(0.9 0.2 155 / 0.14)",
    wallpaper:
      "radial-gradient(1000px 700px at 20% -10%, oklch(0.35 0.22 150 / 0.32), transparent 60%), radial-gradient(700px 500px at 90% 100%, oklch(0.28 0.18 165 / 0.22), transparent 60%)",
    scheme: "dark",
  },
  cyber: {
    label: "Cyber Neon",
    bg: "oklch(0.07 0.02 300)",
    surface: "oklch(0.12 0.05 300)",
    surface2: "oklch(0.16 0.07 300)",
    fg: "oklch(0.98 0.02 300)",
    muted: "oklch(0.7 0.05 300)",
    border: "oklch(0.85 0.2 320 / 0.18)",
    wallpaper:
      "radial-gradient(900px 600px at 15% 0%, oklch(0.45 0.28 320 / 0.35), transparent 55%), radial-gradient(800px 600px at 90% 100%, oklch(0.45 0.25 200 / 0.32), transparent 55%), radial-gradient(600px 500px at 50% 50%, oklch(0.3 0.2 280 / 0.2), transparent 60%)",
    scheme: "dark",
  },
};

export const WALLPAPERS: Record<WallpaperId, { label: string; value: string }> = {
  aurora: {
    label: "Aurora",
    value:
      "radial-gradient(600px 400px at 20% 10%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%), radial-gradient(500px 400px at 90% 90%, color-mix(in oklab, var(--primary-glow) 25%, transparent), transparent 60%)",
  },
  nebula: {
    label: "Nebula",
    value:
      "radial-gradient(500px 400px at 10% 10%, oklch(0.4 0.2 300 / 0.35), transparent 60%), radial-gradient(500px 400px at 90% 100%, oklch(0.4 0.18 220 / 0.3), transparent 60%)",
  },
  ocean: {
    label: "Ocean",
    value:
      "radial-gradient(500px 400px at 50% 0%, oklch(0.4 0.16 235 / 0.35), transparent 60%), radial-gradient(500px 400px at 50% 100%, oklch(0.35 0.14 200 / 0.3), transparent 60%)",
  },
  sunset: {
    label: "Sunset",
    value:
      "radial-gradient(500px 400px at 20% 100%, oklch(0.45 0.2 30 / 0.4), transparent 60%), radial-gradient(500px 400px at 80% 0%, oklch(0.5 0.18 350 / 0.3), transparent 60%)",
  },
  graphite: {
    label: "Graphite",
    value:
      "linear-gradient(145deg, oklch(0.16 0.005 280), oklch(0.11 0.005 280))",
  },
  mesh: {
    label: "Mesh",
    value:
      "conic-gradient(from 140deg at 30% 30%, oklch(0.35 0.15 300 / 0.35), oklch(0.3 0.12 250 / 0.3), oklch(0.35 0.15 330 / 0.3), oklch(0.35 0.15 300 / 0.35))",
  },
};

const DEFAULT_PROFILE: Profile = {
  displayName: "Alex Morgan",
  username: "alex.morgan",
  bio: "Building alpha, one candle at a time. Crypto trader · DeFi native.",
  phone: "+1 (555) 018-2201",
  email: "alex@hoox.io",
  website: "hoox.io/alex",
  birthday: "1996-04-12",
  location: "Lisbon, Portugal",
  avatarColor: "var(--gradient-brand)",
  coverGradient:
    "linear-gradient(135deg, color-mix(in oklab, var(--primary) 65%, transparent), color-mix(in oklab, var(--primary-glow) 55%, transparent))",
  verified: true,
  online: true,
  cryptoId: "CV-8QF3-27M9-A0LP",
  walletAddress: "0x8fA4…C21e",
  walletChain: "Ethereum",
  socials: {
    twitter: "https://x.com/alexmorgan",
    telegram: "https://t.me/alexmorgan",
    discord: "https://discord.com/users/alex.cv",
    github: "https://github.com/alexmorgan",
    tradingview: "https://tradingview.com/u/alexmorgan",
  },
  badge: "verified",
  availableBadges: [
    "none",
    "official",
    "verified",
    "premium",
    "creator",
    "analyst",
    "educator",
    "partner",
    "top-trader",
  ],
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("dark");
  const [accent, setAccent] = useState<AccentId>("violet");
  const [bubble, setBubble] = useState<BubbleStyle>("modern");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [radius, setRadius] = useState<number>(16);
  const [motion, setMotion] = useState<Motion>("normal");
  const [appIcon, setAppIcon] = useState<AppIcon>("aurora");
  const [wallpaper, setWallpaper] = useState<WallpaperId>("aurora");
  const [blur, setBlur] = useState<number>(12);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  const value = useMemo(
    () => ({
      theme, setTheme, accent, setAccent, bubble, setBubble,
      fontSize, setFontSize, radius, setRadius, motion, setMotion,
      appIcon, setAppIcon, wallpaper, setWallpaper, blur, setBlur,
      profile, setProfile,
    }),
    [theme, accent, bubble, fontSize, radius, motion, appIcon, wallpaper, blur, profile],
  );
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsCtx);
  if (!c) throw new Error("useSettings must be inside SettingsProvider");
  return c;
}

/**
 * NOTE: This used to set --background/--foreground/--primary/etc. locally,
 * shadowing whatever theme the rest of the app was using. That's been
 * removed — colors now come from the app-wide ThemeProvider (see
 * src/hooks/use-theme.tsx), which writes them onto <html> so this screen and
 * every other screen share exactly one source of truth. Picking a color here
 * (via AppearanceScreen -> useTheme().setTheme) changes the whole app, not
 * just this page. This function now only carries the cosmetic, non-color
 * knobs (radius/font size/blur) that are fine to stay screen-local.
 */
export function themeStyle(
  _theme: ThemeId,
  _accent: AccentId,
  radius: number,
  fontSize: FontSize,
  blur = 22,
): React.CSSProperties {
  const fs = { small: 14, medium: 15.5, large: 17, xl: 18.5 }[fontSize];
  return {
    ["--radius" as string]: `${radius}px`,
    ["--bubble-radius" as string]: `${radius}px`,
    ["--app-font-size" as string]: `${fs}px`,
    ["--app-blur" as string]: `${blur}px`,
    fontSize: `${fs}px`,
  };
}
