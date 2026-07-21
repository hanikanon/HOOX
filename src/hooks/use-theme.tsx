import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BUILT_IN_THEMES,
  DEFAULT_DARK_THEME_ID,
  DEFAULT_LIGHT_THEME_ID,
  deriveThemeVars,
  findTheme,
  type ThemeSeed,
} from "@/lib/themes";

const STORAGE_KEY = "cryptvora:theme-settings";

interface StoredSettings {
  themeId: string;
  customThemes: ThemeSeed[];
  autoSchedule: boolean;
  /** Manually-remembered picks so enabling auto-schedule starts from the
   *  user's latest light/dark taste instead of a hardcoded pair. */
  dayThemeId: string;
  nightThemeId: string;
}

const DEFAULT_SETTINGS: StoredSettings = {
  themeId: DEFAULT_DARK_THEME_ID,
  customThemes: [],
  autoSchedule: false,
  dayThemeId: DEFAULT_LIGHT_THEME_ID,
  nightThemeId: DEFAULT_DARK_THEME_ID,
};

function loadSettings(): StoredSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function isDaytime(date: Date) {
  const h = date.getHours();
  return h >= 7 && h < 19;
}

interface ThemeContextValue {
  /** The theme actually being displayed right now (resolves auto-schedule). */
  themeId: string;
  activeTheme: ThemeSeed;
  allThemes: ThemeSeed[];
  customThemes: ThemeSeed[];
  autoSchedule: boolean;
  setTheme: (id: string) => void;
  setAutoSchedule: (v: boolean) => void;
  createCustomTheme: (input: Omit<ThemeSeed, "id" | "builtIn">) => ThemeSeed;
  deleteCustomTheme: (id: string) => void;
  resetToDefault: () => void;
  exportThemes: () => string;
  importThemes: (json: string) => { imported: number; error?: string };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted settings once, client-side only (avoids SSR mismatch).
  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  // Re-evaluate which side of the day/night split we're on once a minute
  // while auto-schedule is enabled.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!settings.autoSchedule) return;
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [settings.autoSchedule]);

  const effectiveThemeId = settings.autoSchedule
    ? isDaytime(now)
      ? settings.dayThemeId
      : settings.nightThemeId
    : settings.themeId;

  const allThemes = useMemo(
    () => [...BUILT_IN_THEMES, ...settings.customThemes],
    [settings.customThemes],
  );
  const activeTheme =
    findTheme(effectiveThemeId, settings.customThemes) ??
    BUILT_IN_THEMES.find((t) => t.id === DEFAULT_DARK_THEME_ID)!;

  // Apply the resolved theme to the DOM as CSS custom properties.
  useEffect(() => {
    const vars = deriveThemeVars(activeTheme);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.classList.remove("dark", "light");
    root.classList.add(activeTheme.mode);
  }, [activeTheme]);

  const setTheme = (id: string) => {
    setSettings((s) => {
      const theme = findTheme(id, s.customThemes);
      if (!theme) return s;
      return {
        ...s,
        themeId: id,
        dayThemeId: theme.mode === "light" ? id : s.dayThemeId,
        nightThemeId: theme.mode === "dark" ? id : s.nightThemeId,
      };
    });
  };

  const setAutoSchedule = (v: boolean) => setSettings((s) => ({ ...s, autoSchedule: v }));

  const createCustomTheme: ThemeContextValue["createCustomTheme"] = (input) => {
    const theme: ThemeSeed = { ...input, id: `custom-${Date.now().toString(36)}`, builtIn: false };
    setSettings((s) => ({ ...s, customThemes: [...s.customThemes, theme] }));
    return theme;
  };

  const deleteCustomTheme = (id: string) => {
    setSettings((s) => ({
      ...s,
      customThemes: s.customThemes.filter((t) => t.id !== id),
      themeId: s.themeId === id ? DEFAULT_DARK_THEME_ID : s.themeId,
      dayThemeId: s.dayThemeId === id ? DEFAULT_LIGHT_THEME_ID : s.dayThemeId,
      nightThemeId: s.nightThemeId === id ? DEFAULT_DARK_THEME_ID : s.nightThemeId,
    }));
  };

  const resetToDefault = () => setSettings(DEFAULT_SETTINGS);

  const exportThemes = () => JSON.stringify({ customThemes: settings.customThemes }, null, 2);

  const importThemes: ThemeContextValue["importThemes"] = (json) => {
    try {
      const parsed = JSON.parse(json);
      const incoming: unknown[] = Array.isArray(parsed) ? parsed : parsed?.customThemes;
      if (!Array.isArray(incoming)) throw new Error("This file doesn't contain any themes.");
      const cleaned: ThemeSeed[] = incoming
        .filter(
          (t): t is ThemeSeed =>
            !!t &&
            typeof t === "object" &&
            typeof (t as ThemeSeed).name === "string" &&
            ((t as ThemeSeed).mode === "dark" || (t as ThemeSeed).mode === "light"),
        )
        .map((t) => ({
          ...t,
          id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          builtIn: false,
        }));
      if (cleaned.length === 0) throw new Error("No valid themes found in this file.");
      setSettings((s) => ({ ...s, customThemes: [...s.customThemes, ...cleaned] }));
      return { imported: cleaned.length };
    } catch (err) {
      return { imported: 0, error: err instanceof Error ? err.message : "Invalid theme file." };
    }
  };

  const value: ThemeContextValue = {
    themeId: effectiveThemeId,
    activeTheme,
    allThemes,
    customThemes: settings.customThemes,
    autoSchedule: settings.autoSchedule,
    setTheme,
    setAutoSchedule,
    createCustomTheme,
    deleteCustomTheme,
    resetToDefault,
    exportThemes,
    importThemes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
