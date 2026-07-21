import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera, Image as ImageIcon, Film, FileText, MapPin, User,
  Music, Sticker, Sparkles,
} from "lucide-react";
import { haptic, sfx } from "@/lib/sfx";

export type PickedAttachment = {
  id: string;
  kind: "image" | "video" | "file";
  url: string;
  name: string;
  size: number;
  mime: string;
};

type Tile = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  accept?: string;
  multiple?: boolean;
  capture?: boolean;
  toastOnly?: boolean;
};

const tiles: Tile[] = [
  { key: "camera",   label: "Camera",   icon: Camera,    tint: "from-orange-500/35 to-rose-500/20", accept: "image/*", multiple: false, capture: true },
  { key: "gallery",  label: "Gallery",  icon: ImageIcon, tint: "from-fuchsia-500/35 to-purple-500/20", accept: "image/*", multiple: true },
  { key: "video",    label: "Videos",   icon: Film,      tint: "from-sky-500/35 to-cyan-500/20", accept: "video/*", multiple: true },
  { key: "file",     label: "Documents",icon: FileText,  tint: "from-emerald-500/35 to-teal-500/20", accept: "*/*", multiple: true },
  { key: "audio",    label: "Audio",    icon: Music,     tint: "from-amber-500/35 to-yellow-500/20", accept: "audio/*", multiple: true },
  { key: "contact",  label: "Contact",  icon: User,      tint: "from-indigo-500/35 to-violet-500/20", toastOnly: true },
  { key: "location", label: "Location", icon: MapPin,    tint: "from-lime-500/30 to-emerald-500/15", toastOnly: true },
  { key: "gif",      label: "GIF",      icon: Sparkles,  tint: "from-pink-500/35 to-rose-500/20", toastOnly: true },
  { key: "sticker",  label: "Stickers", icon: Sticker,   tint: "from-violet-500/35 to-indigo-500/20", toastOnly: true },
];

export function AttachmentSheet({
  open, onClose, onPicked,
}: {
  open: boolean;
  onClose: () => void;
  onPicked: (items: PickedAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (accept: string, multiple: boolean, capture?: boolean) => {
    const el = inputRef.current;
    if (!el) return;
    el.setAttribute("accept", accept);
    if (multiple) el.setAttribute("multiple", ""); else el.removeAttribute("multiple");
    if (capture) el.setAttribute("capture", "environment"); else el.removeAttribute("capture");
    el.value = "";
    el.click();
  };

  const onFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const items: PickedAttachment[] = Array.from(files).map((f) => {
      const kind: PickedAttachment["kind"] =
        f.type.startsWith("image/") ? "image" :
        f.type.startsWith("video/") ? "video" : "file";
      return {
        id: crypto.randomUUID(),
        kind, url: URL.createObjectURL(f),
        name: f.name, size: f.size, mime: f.type || "application/octet-stream",
      };
    });
    onPicked(items);
    sfx.send();
    haptic(8);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 320, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="glass-strong gpu fixed inset-x-2 bottom-2 z-50 rounded-[28px] border border-border/60 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl shadow-black/60"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="text-[13px] font-semibold text-foreground/90">Share</div>
              <div className="text-[11px] text-muted-foreground">Tap to attach</div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {tiles.map((t, i) => (
                <motion.button
                  key={t.key}
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.022 * i, type: "spring", stiffness: 440, damping: 26 } }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    sfx.tap(); haptic(6);
                    if (t.toastOnly) {
                      // graceful stub: dispatch a toast via a custom event so index can show it
                      window.dispatchEvent(new CustomEvent("cryptvora:toast", { detail: `${t.label} — coming soon` }));
                      onClose();
                      return;
                    }
                    if (t.accept) openPicker(t.accept, !!t.multiple, t.capture);
                  }}
                  className={`group relative flex flex-col items-center justify-center gap-2 rounded-[22px] bg-gradient-to-br ${t.tint} p-3.5 ring-1 ring-white/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/12 ring-1 ring-white/15 backdrop-blur-md">
                    <t.icon className="h-[19px] w-[19px] text-foreground" />
                  </div>
                  <span className="text-[12px] font-medium text-foreground/90">{t.label}</span>
                </motion.button>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
