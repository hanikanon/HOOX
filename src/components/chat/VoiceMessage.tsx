import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  duration: number; // seconds
  outgoing?: boolean;
  waveform?: number[]; // 0..1 values
};

const defaultWave = Array.from({ length: 42 }, (_, i) =>
  0.25 + Math.abs(Math.sin(i * 0.7) * 0.55) + Math.abs(Math.cos(i * 0.31) * 0.2),
).map(v => Math.min(1, v));

export function VoiceMessage({ duration, outgoing, waveform = defaultWave }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now();
    const tick = (t: number) => {
      const elapsed = ((t - startRef.current) / 1000) * speed + baseRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) { setPlaying(false); baseRef.current = 0; setProgress(0); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed, duration]);

  const toggle = () => {
    if (playing) { baseRef.current = progress * duration; setPlaying(false); }
    else setPlaying(true);
  };

  const cycleSpeed = () => setSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1));

  const total = `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`;
  const cur = Math.floor(duration * progress);
  const curLabel = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, "0")}`;

  const fg = outgoing ? "text-bubble-out-foreground" : "text-foreground";
  const dim = outgoing ? "text-bubble-out-foreground/70" : "text-muted-foreground";
  const barBase = outgoing ? "bg-bubble-out-foreground/30" : "bg-foreground/25";
  const barFill = outgoing ? "bg-bubble-out-foreground" : "bg-primary";
  const btnBg = outgoing ? "bg-bubble-out-foreground/15" : "bg-primary/15";

  return (
    <div className={`flex min-w-[220px] items-center gap-3 ${fg}`}>
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={`tap active:tap-active flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${btnBg}`}
      >
        {playing
          ? <Pause className="h-[18px] w-[18px]" fill="currentColor" />
          : <Play className="h-[18px] w-[18px]" fill="currentColor" />}
      </button>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex h-6 items-center gap-[3px]">
          {waveform.map((v, i) => {
            const active = i / waveform.length <= progress;
            return (
              <span
                key={i}
                className={`w-[3px] rounded-full transition-colors duration-150 ${active ? barFill : barBase}`}
                style={{ height: `${Math.max(15, v * 100)}%` }}
              />
            );
          })}
        </div>
        <div className={`flex items-center justify-between text-[11px] ${dim}`}>
          <span className="tabular-nums">{playing || progress > 0 ? curLabel : total}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cycleSpeed}
            className={`rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${btnBg} ${fg}`}
          >
            {speed}×
          </motion.button>
        </div>
      </div>
    </div>
  );
}
