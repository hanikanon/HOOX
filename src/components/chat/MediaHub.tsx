import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, Image as ImageIcon, Film, FileText, Mic, Link2, LayoutGrid, Download, Play } from "lucide-react";
import type { Message } from "./MessageItem";

type Tab = "all" | "photos" | "videos" | "files" | "voice" | "links";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all",    label: "All",    icon: LayoutGrid },
  { key: "photos", label: "Photos", icon: ImageIcon },
  { key: "videos", label: "Videos", icon: Film },
  { key: "files",  label: "Files",  icon: FileText },
  { key: "voice",  label: "Voice",  icon: Mic },
  { key: "links",  label: "Links",  icon: Link2 },
];

const URL_RE = /\bhttps?:\/\/[^\s)]+/gi;

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaHub({
  open, messages, onClose,
}: {
  open: boolean;
  messages: Message[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("all");

  const buckets = useMemo(() => {
    const photos: { id: string; url: string; name: string; time: string }[] = [];
    const videos: { id: string; url: string; name: string; time: string }[] = [];
    const files: { id: string; url: string; name: string; size: number; time: string }[] = [];
    const voice: { id: string; duration: number; time: string; outgoing: boolean }[] = [];
    const links: { id: string; url: string; time: string; snippet: string }[] = [];
    for (const m of messages) {
      if (m.deleted) continue;
      for (const a of m.attachments ?? []) {
        if (a.kind === "image") photos.push({ id: a.id, url: a.url, name: a.name, time: m.time });
        else if (a.kind === "video") videos.push({ id: a.id, url: a.url, name: a.name, time: m.time });
        else files.push({ id: a.id, url: a.url, name: a.name, size: a.size, time: m.time });
      }
      if (m.voice) voice.push({ id: m.id, duration: m.voice.duration, time: m.time, outgoing: m.author === "me" });
      if (m.text) {
        const found = m.text.match(URL_RE);
        if (found) for (const u of found) links.push({ id: `${m.id}-${u}`, url: u, time: m.time, snippet: m.text });
      }
    }
    return { photos, videos, files, voice, links };
  }, [messages]);

  const counts = {
    all: buckets.photos.length + buckets.videos.length + buckets.files.length + buckets.voice.length + buckets.links.length,
    photos: buckets.photos.length,
    videos: buckets.videos.length,
    files: buckets.files.length,
    voice: buckets.voice.length,
    links: buckets.links.length,
  };

  const empty = counts[tab] === 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="glass-strong gpu fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col rounded-t-[28px] border-t border-border/60 shadow-2xl shadow-black/60"
          >
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-white/15" />
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-[16px] font-semibold">Shared content</div>
                <div className="text-[11.5px] text-muted-foreground">{counts.all} items in this conversation</div>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="tap active:tap-active flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scroll-fade flex gap-1.5 overflow-x-auto px-3 pb-2">
              {TABS.map(t => {
                const active = tab === t.key;
                const c = counts[t.key];
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`tap active:tap-active flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ring-1 transition-colors ${
                      active
                        ? "bg-bubble-gradient text-primary-foreground ring-transparent shadow shadow-primary/30"
                        : "bg-white/5 text-foreground/80 ring-white/10 hover:bg-white/10"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                    <span className={`tabular-nums text-[10.5px] opacity-70 ${active ? "" : ""}`}>{c}</span>
                  </button>
                );
              })}
            </div>

            <div className="scroll-fade flex-1 overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),1rem)]">
              {empty && (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-[13.5px] font-medium">Nothing here yet</div>
                  <div className="text-[11.5px] text-muted-foreground">Shared {tab === "all" ? "content" : tab} will appear here.</div>
                </div>
              )}

              {(tab === "all" || tab === "photos") && buckets.photos.length > 0 && (
                <Section title="Photos">
                  <div className="grid grid-cols-3 gap-1.5">
                    {buckets.photos.map((p, i) => (
                      <motion.a
                        key={p.id}
                        href={p.url} target="_blank" rel="noreferrer"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.015 * i } }}
                        className="relative aspect-square overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/5"
                      >
                        <img src={p.url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                      </motion.a>
                    ))}
                  </div>
                </Section>
              )}

              {(tab === "all" || tab === "videos") && buckets.videos.length > 0 && (
                <Section title="Videos">
                  <div className="grid grid-cols-3 gap-1.5">
                    {buckets.videos.map(v => (
                      <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/5">
                        <video src={v.url} className="h-full w-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/60 p-1.5">
                            <Play className="h-3.5 w-3.5 text-white" fill="currentColor" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </Section>
              )}

              {(tab === "all" || tab === "files") && buckets.files.length > 0 && (
                <Section title="Files">
                  <div className="flex flex-col gap-1.5">
                    {buckets.files.map(f => (
                      <div key={f.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bubble-gradient text-primary-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13.5px] font-medium">{f.name}</div>
                          <div className="text-[11px] text-muted-foreground">{fmtSize(f.size)} · {f.time}</div>
                        </div>
                        <a href={f.url} download={f.name} className="tap active:tap-active rounded-full p-2 hover:bg-white/10">
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(tab === "all" || tab === "voice") && buckets.voice.length > 0 && (
                <Section title="Voice messages">
                  <div className="flex flex-col gap-1.5">
                    {buckets.voice.map(v => (
                      <div key={v.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Mic className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-medium">{v.outgoing ? "You" : "Elena Vance"}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, "0")} · {v.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(tab === "all" || tab === "links") && buckets.links.length > 0 && (
                <Section title="Links">
                  <div className="flex flex-col gap-1.5">
                    {buckets.links.map(l => (
                      <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                         className="flex items-start gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10 hover:bg-white/[0.07]">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                          <Link2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-primary">{l.url}</div>
                          <div className="line-clamp-1 text-[11.5px] text-muted-foreground">{l.snippet}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</div>
      {children}
    </div>
  );
}
