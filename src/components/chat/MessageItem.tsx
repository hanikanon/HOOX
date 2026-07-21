import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { Check, CheckCheck, CornerUpLeft, Pin, SmilePlus } from "lucide-react";
import { VoiceMessage } from "./VoiceMessage";
import { MediaGrid } from "./MediaGrid";
import type { PickedAttachment } from "./AttachmentSheet";
import { highlight } from "./SearchBar";
import { haptic, sfx } from "@/lib/sfx";


export type MessageStatus = "sent" | "delivered" | "read";
export type Message = {
  id: string;
  author: "me" | "them";
  time: string;
  status?: MessageStatus;
  text?: string;
  voice?: { duration: number };
  reply?: { name: string; text: string };
  reactions?: { emoji: string; count: number }[];
  attachments?: PickedAttachment[];
  pinned?: boolean;
  edited?: boolean;
  deleted?: boolean;
};

export type MessageAction =
  | "reply" | "forward" | "copy" | "pin" | "edit"
  | "share" | "select" | "delete-me" | "delete-all" | "info";

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "👏", "🔥"];

function MessageItemBase({
  m, initial, query, active, onReact, onAction,
}: {
  m: Message;
  initial: boolean;
  query?: string;
  active?: boolean;
  onReact: (id: string, emoji: string) => void;
  onAction: (id: string, action: MessageAction) => void;
}) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outgoing = m.author === "me";
  const x = useMotionValue(0);
  const replyOpacity = useTransform(x, [0, 40, 90], [0, 0.6, 1]);
  const replyScale = useTransform(x, [0, 90], [0.6, 1]);
  const reactOpacity = useTransform(x, [-90, -40, 0], [1, 0.6, 0]);
  const reactScale = useTransform(x, [-90, 0], [1, 0.6]);
  const triggeredRef = useRef(false);

  const openAt = (px: number, py: number) => { haptic(14); sfx.press(); setMenu({ x: px, y: py }); };
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const px = e.clientX, py = e.clientY;
    holdRef.current = setTimeout(() => openAt(px, py), 380);
  };
  const cancelHold = () => { if (holdRef.current) clearTimeout(holdRef.current); };
  useEffect(() => () => cancelHold(), []);

  const actionList: { key: MessageAction; label: string; danger?: boolean; mine?: boolean }[] = [
    { key: "reply", label: "Reply" },
    { key: "copy",  label: "Copy" },
    { key: "forward", label: "Forward" },
    { key: "share", label: "Share" },
    { key: "pin",   label: m.pinned ? "Unpin" : "Pin" },
    ...(outgoing ? [{ key: "edit" as const, label: "Edit" }] : []),
    { key: "info",  label: "Message info" },
    { key: "select",label: "Select" },
    { key: "delete-me", label: "Delete for me", danger: true },
    ...(outgoing ? [{ key: "delete-all" as const, label: "Delete for everyone", danger: true }] : []),
  ];

  const renderText = (t: string) => (query ? highlight(t, query) : t);

  return (
    <>
      <motion.div
        layout="position"
        initial={initial ? { opacity: 0, y: 8, scale: 0.98 } : false}
        animate={{
          opacity: 1, y: 0, scale: 1,
          boxShadow: active ? "0 0 0 3px color-mix(in oklab, var(--primary) 60%, transparent)" : "0 0 0 0 transparent",
        }}
        transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.6 }}
        className={`relative flex w-full ${outgoing ? "justify-end" : "justify-start"} px-3`}
      >
        {/* Swipe affordances */}
        <motion.div
          style={{ opacity: replyOpacity, scale: replyScale }}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40"
        >
          <CornerUpLeft className="h-4 w-4" />
        </motion.div>
        <motion.div
          style={{ opacity: reactOpacity, scale: reactScale }}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/40 text-foreground ring-1 ring-white/10"
        >
          <SmilePlus className="h-4 w-4" />
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -110, right: 110 }}
          dragElastic={0.18}
          dragMomentum={false}
          style={{ x }}
          onDrag={(_, info) => {
            if (!triggeredRef.current && Math.abs(info.offset.x) > 70) {
              triggeredRef.current = true;
              haptic(10);
            }
          }}
          onDragEnd={(e, info) => {
            if (info.offset.x > 70) onAction(m.id, "reply");
            else if (info.offset.x < -70) {
              const t = e as PointerEvent;
              openAt(t.clientX ?? window.innerWidth / 2, t.clientY ?? window.innerHeight / 2);
            }
            triggeredRef.current = false;
          }}
          onPointerDown={onPointerDown}
          onPointerUp={cancelHold}
          onPointerCancel={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(e) => { e.preventDefault(); openAt(e.clientX, e.clientY); }}
          className={[
            "gpu relative max-w-[78%] select-none rounded-[20px] px-3 py-1.5 shadow-sm touch-pan-y",
            outgoing
              ? "bg-bubble-gradient text-bubble-out-foreground rounded-br-[6px] shadow-primary/20"
              : "bg-bubble-in text-foreground rounded-bl-[6px] ring-1 ring-white/[0.06]",
            active ? "ring-2 ring-primary/70" : "",
          ].join(" ")}
        >

          {m.pinned && (
            <div className={`mb-1 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wide ${outgoing ? "text-bubble-out-foreground/80" : "text-primary"}`}>
              <Pin className="h-3 w-3" /> Pinned
            </div>
          )}

          {m.reply && (
            <div className={[
              "mb-1.5 rounded-lg border-l-2 px-2 py-1 text-[12px]",
              outgoing
                ? "border-bubble-out-foreground/70 bg-black/10 text-bubble-out-foreground/90"
                : "border-primary bg-white/5 text-foreground/80",
            ].join(" ")}>
              <div className="font-semibold leading-tight">{m.reply.name}</div>
              <div className="line-clamp-1 opacity-80">{m.reply.text}</div>
            </div>
          )}

          {m.deleted ? (
            <p className="text-[13.5px] italic opacity-70">Message deleted</p>
          ) : (
            <>
              {m.attachments && m.attachments.length > 0 && (
                <div className="mb-1.5">
                  <MediaGrid items={m.attachments} outgoing={outgoing} />
                </div>
              )}
              {m.text && (
                <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.4] tracking-[-0.005em]">
                  {renderText(m.text)}
                </p>
              )}
              {m.voice && <VoiceMessage duration={m.voice.duration} outgoing={outgoing} />}
            </>
          )}


          <div className={[
            "mt-0.5 flex items-center justify-end gap-1 text-[10px] font-medium",
            outgoing ? "text-bubble-out-foreground/70" : "text-muted-foreground/80",
          ].join(" ")}>
            {m.edited && <span className="opacity-70">edited</span>}
            <span className="tabular-nums">{m.time}</span>
            {outgoing && m.status && !m.deleted && (
              m.status === "read"
                ? <CheckCheck className="h-3 w-3" />
                : m.status === "delivered"
                  ? <CheckCheck className="h-3 w-3 opacity-60" />
                  : <Check className="h-3 w-3 opacity-60" />
            )}
          </div>


          {m.reactions && m.reactions.length > 0 && (
            <div className={`absolute -bottom-3 ${outgoing ? "right-2" : "left-2"} flex gap-1`}>
              {m.reactions.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 4 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="glass flex items-center gap-1 rounded-full border border-border/60 px-1.5 py-0.5 text-[11px] shadow"
                >
                  <span className="leading-none">{r.emoji}</span>
                  <span className="tabular-nums opacity-80">{r.count}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <ContextSheet
        menu={menu}
        actions={actionList}
        onClose={() => setMenu(null)}
        onReact={(e) => { onReact(m.id, e); setMenu(null); }}
        onPick={(a) => { onAction(m.id, a); setMenu(null); }}
      />
    </>
  );
}

export const MessageItem = memo(MessageItemBase, (a, b) =>
  a.m === b.m && a.initial === b.initial && a.query === b.query && a.active === b.active
);

function ContextSheet({
  menu, actions, onClose, onReact, onPick,
}: {
  menu: { x: number; y: number } | null;
  actions: { key: MessageAction; label: string; danger?: boolean }[];
  onClose: () => void;
  onReact: (e: string) => void;
  onPick: (a: MessageAction) => void;
}) {
  return createPortal(
    <AnimatePresence>
      {menu && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 w-[86%] max-w-[320px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass mb-2 flex items-center justify-between gap-1 rounded-2xl border border-border/60 p-2 shadow-2xl">
              {REACTIONS.map((e, i) => (
                <motion.button
                  key={e}
                  initial={{ opacity: 0, y: 8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.02 * i, type: "spring", stiffness: 500, damping: 22 } }}
                  whileTap={{ scale: 1.35 }}
                  onClick={() => onReact(e)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[22px] hover:bg-white/5"
                >
                  {e}
                </motion.button>
              ))}
            </div>
            <div className="glass overflow-hidden rounded-2xl border border-border/60 p-1 shadow-2xl">
              {actions.map(a => (
                <button
                  key={a.key}
                  onClick={() => onPick(a.key)}
                  className={`tap active:tap-active flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[14px] hover:bg-white/5 ${
                    a.danger ? "text-destructive" : ""
                  }`}
                >
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
