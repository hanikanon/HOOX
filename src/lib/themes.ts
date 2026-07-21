/**
 * Hoox theme engine — token generation and built-in presets.
 *
 * Every theme is described as a small "seed" (mode + a couple of hues +
 * chroma/lightness knobs) and expanded into the full CSS custom-property
 * set the app already relies on (see the :root/.dark and .light blocks in
 * styles.css). Generating the palette from a seed — instead of hand-writing
 * ~30 oklch values per theme — keeps every preset internally consistent and
 * makes it trivial for users to create their own custom themes from the same
 * few sliders (mode, background tint, accent color).
 */

export type ThemeMode = "dark" | "light";

export interface ThemeSeed {
  id: string;
  name: string;
  mode: ThemeMode;
  /** Hue (0-360) for backgrounds/surfaces. */
  hue: number;
  /** Chroma for backgrounds/surfaces. Keep this low (0-0.02) for neutral UI chrome. */
  chroma: number;
  /** Hue (0-360) for the primary/accent color. */
  primaryHue: number;
  /** Chroma for the primary/accent color. Typical range 0.14-0.24. */
  primaryChroma: number;
  /** Base lightness of the app background, 0-1. Lower = darker (AMOLED-style). */
  bgLightness: number;
  /** True built-in themes can't be deleted; user-created ones can. */
  builtIn?: boolean;
}

export type ThemeVars = Record<string, string>;

function oklch(l: number, c: number, h: number, alpha?: number) {
  const base = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)}`;
  return alpha === undefined ? `${base})` : `${base} / ${alpha})`;
}

/** Expand a seed into the full CSS custom-property map for the app. */
export function deriveThemeVars(seed: ThemeSeed): ThemeVars {
  const { mode, hue, chroma, primaryHue, primaryChroma, bgLightness } = seed;
  const dark = mode === "dark";

  const bg = bgLightness;
  const fg = dark ? 0.98 : 0.19;
  const surface1 = dark ? bg + 0.035 : Math.min(1, bg - 0.01);
  const surface2 = dark ? bg + 0.07 : Math.min(1, bg - 0.03);
  const surface3 = dark ? bg + 0.11 : Math.min(1, bg - 0.05);
  const primaryL = dark ? 0.7 : 0.5;
  const primaryFgL = dark ? 0.14 : 0.99;
  const mutedFgL = dark ? 0.66 : 0.5;
  const borderAlpha = dark ? 0.07 : 0.08;
  const borderStrongAlpha = dark ? 0.14 : 0.16;

  return {
    "--background": oklch(bg, chroma, hue),
    "--foreground": oklch(fg, chroma * 0.3, hue),

    "--surface": oklch(surface1, chroma, hue),
    "--surface-2": oklch(surface2, chroma, hue),
    "--surface-3": oklch(surface3, chroma, hue),

    "--card": oklch(surface1, chroma, hue),
    "--card-foreground": oklch(fg, chroma * 0.3, hue),
    "--popover": oklch(dark ? surface2 : surface1, chroma, hue),
    "--popover-foreground": oklch(fg, chroma * 0.3, hue),

    "--primary": oklch(primaryL, primaryChroma, primaryHue),
    "--primary-foreground": oklch(primaryFgL, 0.01, primaryHue),
    "--primary-soft": oklch(primaryL, primaryChroma, primaryHue, dark ? 0.12 : 0.1),
    "--primary-glow": oklch(dark ? 0.82 : 0.62, primaryChroma * 0.8, primaryHue),

    "--secondary": oklch(dark ? 0.2 : 0.96, chroma, hue),
    "--secondary-foreground": oklch(dark ? 0.97 : 0.2, 0, 0),

    "--muted": oklch(dark ? 0.18 : 0.955, chroma, hue),
    "--muted-foreground": oklch(mutedFgL, chroma * 0.6, hue),

    "--accent": oklch(dark ? 0.22 : 0.95, Math.max(chroma, 0.007), hue),
    "--accent-foreground": oklch(dark ? 0.98 : 0.2, 0, 0),

    "--destructive": oklch(dark ? 0.66 : 0.6, 0.22, 25),
    "--destructive-foreground": oklch(0.98, 0, 0),
    "--success": oklch(dark ? 0.72 : 0.6, 0.17, 155),

    "--border": oklch(dark ? 1 : 0.2, dark ? 0 : 0.01, hue, borderAlpha),
    "--border-strong": oklch(dark ? 1 : 0.2, dark ? 0 : 0.01, hue, borderStrongAlpha),
    "--input": oklch(dark ? 1 : 0.2, dark ? 0 : 0.01, hue, dark ? 0.06 : 0.08),
    "--ring": oklch(primaryL, primaryChroma, primaryHue, dark ? 0.5 : 0.4),

    "--sidebar": oklch(dark ? Math.max(0, bg - 0.02) : surface1, chroma, hue),
    "--sidebar-foreground": oklch(dark ? 0.92 : 0.2, 0, 0),
    "--sidebar-primary": oklch(primaryL, primaryChroma, primaryHue),
    "--sidebar-primary-foreground": oklch(primaryFgL, 0.01, primaryHue),
    "--sidebar-accent": oklch(dark ? surface2 : surface2, chroma, hue),
    "--sidebar-accent-foreground": oklch(dark ? 0.98 : 0.2, 0, 0),
    "--sidebar-border": oklch(dark ? 1 : 0.2, dark ? 0 : 0.01, hue, dark ? 0.06 : 0.1),
    "--sidebar-ring": oklch(primaryL, primaryChroma, primaryHue, dark ? 0.5 : 0.4),

    "color-scheme": dark ? "dark" : "light",
  };
}

/** The 11 premium built-in themes requested for the theme engine. */
export const BUILT_IN_THEMES: ThemeSeed[] = [
  { id: "amoled-black", name: "AMOLED Black", mode: "dark", hue: 280, chroma: 0, primaryHue: 300, primaryChroma: 0.18, bgLightness: 0, builtIn: true },
  { id: "midnight-black", name: "Midnight Black", mode: "dark", hue: 255, chroma: 0.01, primaryHue: 300, primaryChroma: 0.18, bgLightness: 0.055, builtIn: true },
  { id: "tradingview-dark", name: "TradingView Dark", mode: "dark", hue: 215, chroma: 0.012, primaryHue: 217, primaryChroma: 0.16, bgLightness: 0.1, builtIn: true },
  { id: "soft-dark", name: "Soft Dark", mode: "dark", hue: 280, chroma: 0.008, primaryHue: 300, primaryChroma: 0.16, bgLightness: 0.16, builtIn: true },
  { id: "telegram-blue", name: "Telegram Blue", mode: "dark", hue: 225, chroma: 0.012, primaryHue: 206, primaryChroma: 0.15, bgLightness: 0.12, builtIn: true },
  { id: "ocean-blue", name: "Ocean Blue", mode: "dark", hue: 230, chroma: 0.015, primaryHue: 195, primaryChroma: 0.16, bgLightness: 0.1, builtIn: true },
  { id: "forest-green", name: "Forest Green", mode: "dark", hue: 150, chroma: 0.012, primaryHue: 150, primaryChroma: 0.15, bgLightness: 0.1, builtIn: true },
  { id: "warm-beige", name: "Warm Beige", mode: "light", hue: 70, chroma: 0.012, primaryHue: 55, primaryChroma: 0.13, bgLightness: 0.96, builtIn: true },
  { id: "soft-gray", name: "Soft Gray", mode: "light", hue: 260, chroma: 0.004, primaryHue: 280, primaryChroma: 0.14, bgLightness: 0.965, builtIn: true },
  { id: "premium-light", name: "Premium Light", mode: "light", hue: 90, chroma: 0.003, primaryHue: 300, primaryChroma: 0.19, bgLightness: 0.985, builtIn: true },
  { id: "pure-white", name: "Pure White", mode: "light", hue: 0, chroma: 0, primaryHue: 300, primaryChroma: 0.19, bgLightness: 1, builtIn: true },
];

export const DEFAULT_DARK_THEME_ID = "midnight-black";
export const DEFAULT_LIGHT_THEME_ID = "premium-light";

export function findTheme(id: string, custom: ThemeSeed[]): ThemeSeed | undefined {
  return BUILT_IN_THEMES.find((t) => t.id === id) ?? custom.find((t) => t.id === id);
}
