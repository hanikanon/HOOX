import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

export function SearchBar({
  query, onQuery, count, index, onPrev, onNext, onClose,
}: {
  query: string;
  onQuery: (s: string) => void;
  count: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="glass sticky top-0 z-30 border-b border-border/40"
    >
      <div className="flex items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search in conversation"
          className="flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {count === 0 ? "0/0" : `${index + 1}/${count}`}
          </span>
        )}
        <button aria-label="Previous" onClick={onPrev} disabled={count === 0}
          className="tap active:tap-active flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5 disabled:opacity-30">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button aria-label="Next" onClick={onNext} disabled={count === 0}
          className="tap active:tap-active flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5 disabled:opacity-30">
          <ChevronDown className="h-4 w-4" />
        </button>
        <button aria-label="Close" onClick={onClose}
          className="tap active:tap-active flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function highlight(text: string, query: string) {
  if (!query) return text;
  const q = query.trim();
  if (!q) return text;
  const parts: (string | { m: string })[] = [];
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  let last = 0;
  text.replace(re, (m, _g, idx: number) => {
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push({ m });
    last = idx + m.length;
    return m;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) =>
    typeof p === "string"
      ? <span key={i}>{p}</span>
      : <mark key={i} className="rounded-sm bg-primary/40 text-foreground">{p.m}</mark>
  );
}
