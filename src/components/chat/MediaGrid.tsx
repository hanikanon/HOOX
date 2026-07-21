import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Play, FileText, Download } from "lucide-react";
import type { PickedAttachment } from "./AttachmentSheet";

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({ items, outgoing }: { items: PickedAttachment[]; outgoing: boolean }) {
  const [viewer, setViewer] = useState<number | null>(null);
  const media = items.filter(i => i.kind !== "file");
  const files = items.filter(i => i.kind === "file");

  const cols = media.length === 1 ? 1 : 2;
  const showAll = media.slice(0, 4);
  const extra = media.length - showAll.length;

  return (
    <div className="flex flex-col gap-2">
      {media.length > 0 && (
        <div
          className={`grid gap-1 overflow-hidden rounded-2xl ${cols === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          style={{ maxWidth: 300 }}
        >
          {showAll.map((m, i) => {
            const tall = media.length === 3 && i === 0;
            return (
              <motion.button
                key={m.id}
                layout
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewer(i)}
                className={`relative overflow-hidden bg-black/40 ${tall ? "row-span-2 aspect-square" : "aspect-square"}`}
              >
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <video src={m.url} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/60 p-2">
                        <Play className="h-5 w-5 text-white" fill="currentColor" />
                      </div>
                    </div>
                  </>
                )}
                {i === 3 && extra > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
                    +{extra}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {files.map(f => (
        <div
          key={f.id}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
            outgoing ? "bg-black/15" : "bg-white/5"
          } ring-1 ring-white/10`}
          style={{ maxWidth: 300 }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bubble-gradient text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-medium">{f.name}</div>
            <div className="text-[11px] opacity-70">{fmtSize(f.size)}</div>
          </div>
          <a href={f.url} download={f.name} className="tap active:tap-active rounded-full p-1.5 hover:bg-white/10">
            <Download className="h-4 w-4" />
          </a>
        </div>
      ))}

      <AnimatePresence>
        {viewer !== null && media[viewer] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
            onClick={() => setViewer(null)}
          >
            <button
              className="absolute right-4 top-[max(env(safe-area-inset-top),1rem)] rounded-full bg-white/10 p-2 text-white"
              onClick={(e) => { e.stopPropagation(); setViewer(null); }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="max-h-[85vh] max-w-[92vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {media[viewer].kind === "image" ? (
                <img src={media[viewer].url} alt={media[viewer].name} className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain" />
              ) : (
                <video src={media[viewer].url} controls autoPlay className="max-h-[85vh] max-w-[92vw] rounded-2xl" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
