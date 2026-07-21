import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, ScanLine, Share2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSettings } from "./SettingsContext";

// Deterministic pseudo-QR grid based on a string. Decorative only.
function useQRMatrix(input: string, size = 25) {
  return useMemo(() => {
    let seed = 0;
    for (let i = 0; i < input.length; i++) seed = (seed * 31 + input.charCodeAt(i)) >>> 0;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 0xffffffff;
    };
    const grid: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) row.push(rand() > 0.52);
      grid.push(row);
    }
    // Finder patterns
    const stamp = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const border = x === 0 || y === 0 || x === 6 || y === 6;
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = border || inner;
        }
    };
    stamp(0, 0);
    stamp(size - 7, 0);
    stamp(0, size - 7);
    // Clear separators
    for (let i = 0; i < 8; i++) {
      if (grid[7]) grid[7][i] = false;
      if (grid[i]) grid[i][7] = false;
      if (grid[7]) grid[7][size - 1 - i] = false;
      if (grid[i]) grid[i][size - 8] = false;
      if (grid[size - 8]) grid[size - 8][i] = false;
      if (grid[size - 1 - i]) grid[size - 1 - i][7] = false;
    }
    return grid;
  }, [input, size]);
}

export function QRScreen() {
  const { profile } = useSettings();
  const grid = useQRMatrix(`hoox://user/${profile.username}`);
  const size = grid.length;
  const cell = 10;
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const copyUsername = async () => {
    try {
      await navigator.clipboard.writeText(`@${profile.username}`);
      setCopied(true);
      flash("Username copied");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      flash("Copy failed");
    }
  };

  const shareProfile = async () => {
    const url = `https://hoox.io/${profile.username}`;
    const data = {
      title: `${profile.displayName} on Hoox`,
      text: `Connect with @${profile.username} on Hoox`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
        await (navigator as Navigator).share(data);
      } else {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const saveQR = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cryptvora-${profile.username}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    flash("QR saved");
  };

  const scanQR = () => flash("Camera not available in demo");


  return (
    <div className="px-3">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border p-6 text-center"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--primary) 22%, var(--surface)) 0%, var(--surface) 60%)",
          boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--primary) 55%, transparent)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-60 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div className="relative">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Hoox ID
          </p>
          <h2 className="text-[20px] font-semibold text-foreground">{profile.displayName}</h2>
          <p className="mb-5 text-[12.5px] text-muted-foreground">@{profile.username}</p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 22 }}
            className="mx-auto flex w-fit rounded-3xl bg-white p-4 shadow-2xl"
          >
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              width={size * cell}
              height={size * cell}
              viewBox={`0 0 ${size * cell} ${size * cell}`}
            >
              <defs>
                <linearGradient id="qrg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary-glow)" />
                </linearGradient>
              </defs>
              {grid.map((row, y) =>
                row.map((on, x) =>
                  on ? (
                    <rect
                      key={`${x}-${y}`}
                      x={x * cell}
                      y={y * cell}
                      width={cell}
                      height={cell}
                      rx={cell * 0.3}
                      fill="url(#qrg)"
                    />
                  ) : null,
                ),
              )}
              <rect
                x={size * cell / 2 - 22}
                y={size * cell / 2 - 22}
                width={44}
                height={44}
                rx={12}
                fill="white"
              />
              <rect
                x={size * cell / 2 - 18}
                y={size * cell / 2 - 18}
                width={36}
                height={36}
                rx={10}
                fill="url(#qrg)"
              />
              <text
                x={size * cell / 2}
                y={size * cell / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="white"
                fontFamily="Inter, sans-serif"
              >
                CV
              </text>
            </svg>
          </motion.div>

          <button
            onClick={copyUsername}
            className="press mx-auto mt-5 flex items-center gap-1.5 rounded-full border border-border bg-surface-2/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="c" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[var(--success)]">
                  <Check size={13} /> Copied
                </motion.span>
              ) : (
                <motion.span key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <Copy size={13} /> @{profile.username}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <p className="mx-auto mt-4 max-w-[260px] text-[12.5px] text-muted-foreground">
            Anyone who scans this can start a private chat with you on Hoox.
          </p>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <QRAction icon={ScanLine} label="Scan" onClick={scanQR} />
        <QRAction icon={Share2} label="Share" onClick={shareProfile} />
        <QRAction icon={Download} label="Save" onClick={saveQR} />
        <QRAction icon={Copy} label="Copy" onClick={copyUsername} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none fixed inset-x-0 bottom-8 z-40 mx-auto w-fit rounded-full border border-border bg-surface/90 px-4 py-2 text-[12.5px] font-medium text-foreground backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QRAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-xl"
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-2xl"
        style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
      >
        <Icon size={18} />
      </span>
      <span className="text-[12.5px] font-medium text-foreground">{label}</span>
    </motion.button>
  );
}
