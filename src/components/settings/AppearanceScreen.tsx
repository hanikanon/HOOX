import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { deriveThemeVars, type ThemeSeed } from "@/lib/themes";
import {
  WALLPAPERS,
  type BubbleStyle,
  type FontSize,
  type Motion as MotionPref,
  type WallpaperId,
  useSettings,
} from "./SettingsContext";
import { SettingGroup } from "./SettingGroup";

export function AppearanceScreen() {
  const s = useSettings();
  const { themeId, allThemes, setTheme } = useTheme();

  return (
    <>
      <LivePreview />

      <SettingGroup label="Theme">
        <div className="grid grid-cols-2 gap-2 p-3">
          {allThemes.map((t) => (
            <ThemeCard key={t.id} theme={t} active={t.id === themeId} onSelect={() => setTheme(t.id)} />
          ))}
        </div>
        <p className="px-4 pb-3 text-[11px] text-muted-foreground">
          Applies everywhere in the app, not just here.
        </p>
      </SettingGroup>

      <SettingGroup label="Chat bubbles">
        <div className="grid grid-cols-4 gap-2 p-3">
          {(["rounded", "modern", "square", "tail"] as BubbleStyle[]).map((b) => (
            <BubbleCard key={b} id={b} active={s.bubble === b} onSelect={() => s.setBubble(b)} />
          ))}
        </div>
      </SettingGroup>

      <SettingGroup label="Font size">
        <FontSizeControl value={s.fontSize} onChange={s.setFontSize} />
      </SettingGroup>

      <SettingGroup label="Corner radius">
        <RadiusSlider value={s.radius} onChange={s.setRadius} />
      </SettingGroup>

      <SettingGroup label="Blur intensity">
        <BlurSlider value={s.blur} onChange={s.setBlur} />
      </SettingGroup>

      <SettingGroup label="Animation speed">
        <SegmentedRow
          options={[
            { id: "normal", label: "Normal" },
            { id: "fast", label: "Fast" },
            { id: "reduced", label: "Reduce" },
          ]}
          value={s.motion}
          onChange={(v) => s.setMotion(v as MotionPref)}
        />
      </SettingGroup>

      <SettingGroup label="App icon">
        <div className="grid grid-cols-4 gap-3 p-4">
          {(["aurora", "midnight", "prism", "mono"] as const).map((id) => {
            const active = s.appIcon === id;
            const bg =
              id === "aurora"
                ? "linear-gradient(135deg, var(--primary), var(--primary-glow))"
                : id === "midnight"
                  ? "linear-gradient(135deg, #0f172a, #1e293b)"
                  : id === "prism"
                    ? "conic-gradient(from 200deg, #a78bfa, #f0abfc, #67e8f9, #a78bfa)"
                    : "linear-gradient(135deg, #1f2937, #111827)";
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.94 }}
                onClick={() => s.setAppIcon(id)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-[16px] text-white"
                  style={{
                    background: bg,
                    boxShadow: active
                      ? "0 0 0 2px var(--surface), 0 0 0 4px var(--primary), 0 12px 28px -8px color-mix(in oklab, var(--primary) 50%, transparent)"
                      : "0 8px 20px -10px rgba(0,0,0,0.6)",
                  }}
                >
                  <span className="text-[18px] font-bold tracking-tight">CV</span>
                </div>
                <span className="text-[11px] capitalize text-muted-foreground">{id}</span>
              </motion.button>
            );
          })}
        </div>
      </SettingGroup>

      <SettingGroup label="Wallpaper">
        <div className="grid grid-cols-3 gap-2 p-3">
          {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => {
            const w = WALLPAPERS[id];
            const active = s.wallpaper === id;
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.96 }}
                onClick={() => s.setWallpaper(id)}
                className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border p-2 text-left"
                style={{
                  background: `${w.value}, var(--surface-2)`,
                  borderColor: active ? "var(--primary)" : "var(--border)",
                  boxShadow: active
                    ? "0 0 0 1px var(--primary), 0 10px 30px -12px color-mix(in oklab, var(--primary) 40%, transparent)"
                    : undefined,
                }}
              >
                <span className="rounded-lg bg-black/40 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                  {w.label}
                </span>
                {active && (
                  <span
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    <Check size={14} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </SettingGroup>
    </>
  );
}

function LivePreview() {
  const s = useSettings();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-6 overflow-hidden rounded-3xl border border-border bg-surface/70 backdrop-blur-xl"
      style={{
        background: `${WALLPAPERS[s.wallpaper].value}, var(--surface)`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          CV
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] font-semibold text-foreground">Live preview</p>
          <p className="text-[11px] text-muted-foreground">Changes apply instantly</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <Bubble side="left" text="How's the BTC trade going? 📈" bubble={s.bubble} />
        <Bubble side="right" text="Up 4.2% — moved the stop to entry." bubble={s.bubble} />
        <Bubble side="left" text="Beautiful. Ping when you exit." bubble={s.bubble} />
      </div>
    </motion.div>
  );
}

function Bubble({ side, text, bubble }: { side: "left" | "right"; text: string; bubble: BubbleStyle }) {
  const isRight = side === "right";
  const radius = (() => {
    const base = "var(--bubble-radius)";
    if (bubble === "square") return "8px";
    if (bubble === "rounded") return "22px";
    if (bubble === "tail") return isRight ? `${base} ${base} 4px ${base}` : `${base} ${base} ${base} 4px`;
    return base;
  })();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isRight ? "justify-end" : "justify-start"}`}
    >
      <div
        className="max-w-[75%] px-3.5 py-2 text-[13.5px]"
        style={{
          borderRadius: radius,
          background: isRight ? "var(--gradient-brand)" : "var(--surface-2)",
          color: isRight ? "white" : "var(--foreground)",
          boxShadow: isRight
            ? "0 8px 24px -12px color-mix(in oklab, var(--primary) 50%, transparent)"
            : "0 1px 0 color-mix(in oklab, white 4%, transparent) inset",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function ThemeCard({ theme, active, onSelect }: { theme: ThemeSeed; active: boolean; onSelect: () => void }) {
  const v = deriveThemeVars(theme);
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="relative overflow-hidden rounded-2xl border p-2.5 text-left"
      style={{
        borderColor: active ? "var(--primary)" : "var(--border)",
        background: v["--surface"],
        boxShadow: active
          ? "0 0 0 1px var(--primary), 0 12px 30px -12px color-mix(in oklab, var(--primary) 50%, transparent)"
          : undefined,
      }}
    >
      <div className="mb-2 h-14 w-full rounded-xl" style={{ background: v["--background"] }}>
        <div className="flex h-full items-end justify-start p-2">
          <div className="h-3 w-10 rounded-full" style={{ background: v["--primary"] }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: v["--foreground"] }}>
          {theme.name}
        </span>
        {active && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-white"
            style={{ background: v["--primary"] }}
          >
            <Check size={12} />
          </span>
        )}
      </div>
    </motion.button>
  );
}

function BubbleCard({
  id,
  active,
  onSelect,
}: {
  id: BubbleStyle;
  active: boolean;
  onSelect: () => void;
}) {
  const radius = id === "square" ? 6 : id === "rounded" ? 22 : 14;
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] capitalize"
      style={{
        borderColor: active ? "var(--primary)" : "var(--border)",
        background: active ? "var(--primary-soft)" : "var(--surface-2)",
        color: active ? "var(--primary)" : "var(--muted-foreground)",
      }}
    >
      <div
        className="h-6 w-10"
        style={{
          borderRadius:
            id === "tail" ? `${radius}px ${radius}px 4px ${radius}px` : `${radius}px`,
          background: "var(--gradient-brand)",
        }}
      />
      {id}
    </motion.button>
  );
}

function FontSizeControl({ value, onChange }: { value: FontSize; onChange: (v: FontSize) => void }) {
  const options: { id: FontSize; label: string; size: number }[] = [
    { id: "small", label: "A", size: 12 },
    { id: "medium", label: "A", size: 15 },
    { id: "large", label: "A", size: 18 },
    { id: "xl", label: "A", size: 22 },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <motion.button
            key={o.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(o.id)}
            className="flex flex-col items-center gap-1 rounded-xl border py-3"
            style={{
              borderColor: active ? "var(--primary)" : "var(--border)",
              background: active ? "var(--primary-soft)" : "var(--surface-2)",
              color: active ? "var(--primary)" : "var(--foreground)",
            }}
          >
            <span style={{ fontSize: o.size, fontWeight: 600, lineHeight: 1 }}>{o.label}</span>
            <span className="text-[10px] capitalize text-muted-foreground">{o.id}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function RadiusSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">Radius</span>
        <span className="text-[13px] font-medium text-[var(--primary)]">{value}px</span>
      </div>
      <input
        type="range"
        min={6}
        max={28}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
        style={{ accentColor: "var(--primary)" }}
      />
      <div className="mt-4 flex items-center justify-between gap-2">
        {[8, 14, 20, 26].map((r) => (
          <div
            key={r}
            className="h-10 flex-1"
            style={{
              borderRadius: r,
              background: "var(--gradient-brand)",
              opacity: value >= r ? 1 : 0.35,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function BlurSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">Backdrop blur</span>
        <span className="text-[13px] font-medium text-[var(--primary)]">{value}px</span>
      </div>
      <input
        type="range"
        min={0}
        max={32}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--primary)" }}
      />
      <div
        className="mt-4 flex h-12 items-center justify-center rounded-2xl border border-border text-[12px] text-muted-foreground"
        style={{
          background: "color-mix(in oklab, var(--background) 60%, transparent)",
          backdropFilter: `blur(${value}px) saturate(160%)`,
          WebkitBackdropFilter: `blur(${value}px) saturate(160%)`,
        }}
      >
        Live preview surface
      </div>
    </div>
  );
}

function SegmentedRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative m-3 grid grid-cols-3 rounded-2xl bg-surface-2 p-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="relative z-10 rounded-xl py-2 text-[13px] font-medium transition-colors"
            style={{ color: active ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
          >
            {active && (
              <motion.span
                layoutId="seg"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: "var(--gradient-brand)",
                  boxShadow: "0 8px 20px -8px color-mix(in oklab, var(--primary) 50%, transparent)",
                }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
