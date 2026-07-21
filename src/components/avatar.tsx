import { cn } from "@/lib/utils";
import { OWL_URL } from "@/components/logo";

export interface AvatarProps {
  seed: string;
  name: string;
  size?: number;
  isOwl?: boolean;
  logoUrl?: string;
  online?: boolean;
  ring?: boolean;
  square?: boolean;
  className?: string;
}

// Curated palette pairs — muted, editorial. No neon purples-on-purples.
const PALETTES: Array<[string, string]> = [
  ["#3f3d56", "#1f1d36"], // graphite
  ["#2c5364", "#0f2027"], // deep teal
  ["#5b3a5f", "#2a1a35"], // aubergine (accent)
  ["#4a4e69", "#22223b"], // dusk
  ["#6b3a2a", "#2b1710"], // umber
  ["#2d5a3d", "#122318"], // moss
  ["#3d4a6b", "#1a2138"], // slate blue
  ["#5c4033", "#2a1e18"], // walnut
  ["#4b5563", "#1f2937"], // steel
  ["#5d4954", "#2b1f27"], // mauve
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  seed,
  name,
  size = 40,
  isOwl = false,
  logoUrl,
  online = false,
  ring = false,
  square = false,
  className,
}: AvatarProps) {
  const [a, b] = PALETTES[hashSeed(seed) % PALETTES.length];
  const radius = square ? Math.round(size * 0.28) : size;
  const fontSize = Math.max(11, Math.round(size * 0.38));
  const dot = Math.max(8, Math.round(size * 0.22));

  const inner = (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden text-white/95"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: logoUrl
          ? "linear-gradient(140deg, #ffffff 0%, #eef0f5 100%)"
          : `linear-gradient(140deg, ${a} 0%, ${b} 100%)`,
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-[72%] w-[72%] object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : isOwl ? (
        <img
          src={OWL_URL}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          width={size}
          height={size}
        />
      ) : (
        <span
          className="select-none font-semibold tracking-tight"
          style={{ fontSize, letterSpacing: "-0.01em" }}
        >
          {initials(name)}
        </span>
      )}
      {/* subtle sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 45%)",
          borderRadius: radius,
        }}
      />
    </div>
  );

  const body = ring ? (
    <div
      className="grid place-items-center rounded-full"
      style={{
        padding: 2.5,
        background:
          "conic-gradient(from 140deg, #a06bff, #ff7ac6, #7ad0ff, #a06bff)",
        width: size + 6,
        height: size + 6,
        borderRadius: square ? Math.round((size + 6) * 0.3) : 9999,
      }}
    >
      <div
        className="grid place-items-center bg-background"
        style={{
          padding: 2,
          width: size + 2,
          height: size + 2,
          borderRadius: square ? Math.round((size + 2) * 0.3) : 9999,
        }}
      >
        {inner}
      </div>
    </div>
  ) : (
    inner
  );

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {body}
      {online && (
        <span
          aria-hidden
          className="absolute right-0 bottom-0 rounded-full bg-[oklch(0.72_0.17_150)] ring-2 ring-background"
          style={{ width: dot, height: dot }}
        />
      )}
    </div>
  );
}

export default Avatar;
