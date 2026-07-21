import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Phone, Video, Search, MoreVertical, ArrowLeft,
  BellOff, User, FileSearch, Images, Pin, Archive, Ban, Flag, Trash2,
} from "lucide-react";
import { haptic, sfx } from "@/lib/sfx";
import { Avatar } from "@/components/avatar";
import { CallPanel } from "@/components/call/CallPanel";

type Item = { icon: React.ComponentType<{ className?: string }>; label: string; hint?: string; danger?: boolean };

type Section = { title?: string; items: Item[] };

const sections: Section[] = [
  {
    items: [
      { icon: FileSearch, label: "Search in chat", hint: "⌘F" },
      { icon: User,       label: "View profile" },
      { icon: Images,     label: "Media, links & files" },
    ],
  },
  {
    title: "Conversation",
    items: [
      { icon: Pin,      label: "Pin conversation" },
      { icon: BellOff,  label: "Mute notifications" },
      { icon: Archive,  label: "Archive chat" },
    ],
  },
  {
    items: [
      { icon: Ban,    label: "Block user",    danger: true },
      { icon: Flag,   label: "Report user",   danger: true },
      { icon: Trash2, label: "Delete conversation", danger: true },
    ],
  },
];

export function ChatHeader({
  name, status, avatarSeed, online, onSearch, onMenuAction,
}: {
  name: string;
  status: string;
  avatarSeed: string;
  online?: boolean;
  onSearch?: () => void;
  onMenuAction?: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flatIndex = (s: number, i: number) => sections.slice(0, s).reduce((n, sec) => n + sec.items.length, 0) + i;

  return (
    <div className="sticky top-0 z-30 px-2 pt-[max(env(safe-area-inset-top),0.375rem)] pb-1.5">
      <div className="pill-bar gpu flex items-center gap-0.5 px-1.5 py-1">
        <Link to="/" aria-label="Back" className="tap active:tap-active flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5 active:bg-white/10">
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>

        <button className="tap active:tap-active flex flex-1 items-center gap-2.5 rounded-2xl px-1 py-0.5 text-left">
          <div className="relative">
            <Avatar seed={avatarSeed} name={name} size={36} ring />
            {online && (
              <span className="online-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background" />
            )}
          </div>
          <div className="min-w-0 -space-y-0.5">
            <div className="truncate text-[14.5px] font-semibold leading-snug tracking-[-0.01em]">{name}</div>
            <div className="truncate text-[11px] font-medium text-muted-foreground/90 leading-snug">{status}</div>
          </div>
        </button>

        <IconBtn aria-label="Voice call" onClick={() => { sfx.tap(); haptic(6); setCallOpen(true); }}>
          <Phone className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn aria-label="Video call" onClick={() => { sfx.tap(); haptic(6); setCallOpen(true); }}>
          <Video className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn aria-label="Search" onClick={() => { sfx.tap(); haptic(6); onSearch?.(); }}>
          <Search className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn ref={btnRef} aria-label="More" onClick={() => { setOpen(v => !v); sfx.tap(); haptic(6); }}>
          <MoreVertical className="h-[17px] w-[17px]" />
        </IconBtn>
      </div>


      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="glass absolute right-2 top-[calc(100%+8px)] z-50 w-[280px] origin-top-right overflow-hidden rounded-3xl border border-border/70 p-2 shadow-2xl shadow-black/60"
              style={{ backgroundImage: "linear-gradient(180deg, color-mix(in oklab, var(--surface-elevated) 85%, transparent), color-mix(in oklab, var(--surface) 75%, transparent))" }}
            >
              {/* Header row */}
              <div className="mb-1 flex items-center gap-3 rounded-2xl px-2 py-2">
                <Avatar seed={avatarSeed} name={name} size={36} ring />
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold">{name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{status}</div>
                </div>
              </div>

              {sections.map((sec, si) => (
                <div key={si} className={si > 0 ? "mt-1 border-t border-border/40 pt-1" : ""}>
                  {sec.title && (
                    <div className="px-3 pb-1 pt-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {sec.title}
                    </div>
                  )}
                  {sec.items.map((m, i) => {
                    const idx = flatIndex(si, i);
                    return (
                      <motion.button
                        key={m.label}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.015 * idx } }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setOpen(false); sfx.tap(); haptic(4); onMenuAction?.(m.label); }}
                        className={`tap active:tap-active flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-[13.5px] hover:bg-white/[0.06] ${
                          m.danger ? "text-destructive" : "text-foreground"
                        }`}
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-white/10 ${
                          m.danger ? "bg-destructive/15" : "bg-white/[0.06]"
                        }`}>
                          <m.icon className="h-[16px] w-[16px]" />
                        </span>
                        <span className="flex-1 text-left font-medium">{m.label}</span>
                        {m.hint && <span className="text-[10.5px] tabular-nums text-muted-foreground/80">{m.hint}</span>}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CallPanel open={callOpen} onClose={() => setCallOpen(false)} />
    </div>
  );
}

const IconBtn = ({
  children, onClick, "aria-label": ariaLabel, ref,
}: {
  children: React.ReactNode; onClick?: () => void; "aria-label": string;
  ref?: React.Ref<HTMLButtonElement>;
}) => (
  <button
    ref={ref}
    aria-label={ariaLabel}
    onClick={onClick}
    className="tap active:tap-active flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5 active:bg-white/10"
  >
    {children}
  </button>
);
