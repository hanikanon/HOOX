import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Composer } from "@/components/chat/Composer";
import { MessageItem, type Message, type MessageAction } from "@/components/chat/MessageItem";
import { SearchBar } from "@/components/chat/SearchBar";
import { MediaHub } from "@/components/chat/MediaHub";
import type { PickedAttachment } from "@/components/chat/AttachmentSheet";
import { sfx } from "@/lib/sfx";
import type { Chat } from "@/lib/mock-data";

const initialMessages: Message[] = [
  { id: "1", author: "them", time: "14:12", text: "Sharing the 4H structure I'm tracking on BTC — clean re-test of the trendline." },
  { id: "2", author: "them", time: "14:13", text: "What's your invalidation on this leg?", reply: { name: "Julian Reyes", text: "Sharing the 4H structure I'm tracking on BTC…" } },
  { id: "3", author: "me", time: "14:16", status: "read", text: "Bias aligns with my swing plan. Waiting for a lower-time-frame confirmation before scaling in.", reactions: [{ emoji: "🔥", count: 4 }] },
  { id: "4", author: "them", time: "14:19", voice: { duration: 42 } },
  { id: "5", author: "me", time: "14:20", status: "read", text: "Listening now. Give me a sec." },
  { id: "6", author: "them", time: "14:22", text: "Breaking support at 62k — watching for a retest before adding size." },
];

export function ChatThread({ chat }: { chat: Chat }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typing, setTyping] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [hitIdx, setHitIdx] = useState(0);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string; text: string } | null>(null);
  const [mediaHub, setMediaHub] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialMessages.map(m => m.id)));

  useEffect(() => {
    const onToast = (e: Event) => toast((e as CustomEvent<string>).detail);
    window.addEventListener("cryptvora:toast", onToast);
    return () => window.removeEventListener("cryptvora:toast", onToast);
  }, []);

  useEffect(() => {
    if (searching) return;
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, searching]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as string[];
    return messages.filter(m => (m.text ?? "").toLowerCase().includes(q)).map(m => m.id);
  }, [query, messages]);

  useEffect(() => { setHitIdx(0); }, [query]);
  useEffect(() => {
    const id = hits[hitIdx];
    if (!id) return;
    const el = document.getElementById(`msg-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hits, hitIdx]);

  const addMessage = (m: Message) => {
    seenIds.current.add(m.id);
    setMessages(prev => [...prev, m]);
  };

  const handleSend = (text: string) => {
    const id = crypto.randomUUID();
    const reply = replyTo ? { name: replyTo.name, text: replyTo.text } : undefined;
    addMessage({ id, author: "me", time: nowHHMM(), status: "sent", text, reply });
    setReplyTo(null);
    // Outgoing: silent. Only status transitions, no sounds.
    setTimeout(() => setMessages(prev => prev.map(x => x.id === id ? { ...x, status: "delivered" } : x)), 700);
    setTimeout(() => setMessages(prev => prev.map(x => x.id === id ? { ...x, status: "read" } : x)), 1700);
    setTimeout(() => setTyping(true), 900);
    setTimeout(() => {
      setTyping(false); sfx.receive();
      addMessage({ id: crypto.randomUUID(), author: "them", time: nowHHMM(), text: replyFor(text) });
    }, 2400);
  };

  const handleVoice = (durationSec: number) => {
    const id = crypto.randomUUID();
    addMessage({ id, author: "me", time: nowHHMM(), status: "sent", voice: { duration: durationSec } });
    // Outgoing voice: silent send.
    setTimeout(() => setMessages(prev => prev.map(x => x.id === id ? { ...x, status: "read" } : x)), 1400);
  };

  const handleAttachments = (items: PickedAttachment[]) => {
    // Group into one media message (Telegram-style)
    const id = crypto.randomUUID();
    addMessage({ id, author: "me", time: nowHHMM(), status: "sent", attachments: items });
    setTimeout(() => setMessages(prev => prev.map(x => x.id === id ? { ...x, status: "delivered" } : x)), 700);
    setTimeout(() => setMessages(prev => prev.map(x => x.id === id ? { ...x, status: "read" } : x)), 1600);
  };

  const handleReact = (id: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m;
      const existing = m.reactions ?? [];
      const found = existing.find(r => r.emoji === emoji);
      const reactions = found
        ? existing.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
        : [...existing, { emoji, count: 1 }];
      return { ...m, reactions };
    }));
    sfx.tap();
  };

  const handleAction = (id: string, a: MessageAction) => {
    const m = messages.find(x => x.id === id);
    if (!m) return;
    switch (a) {
      case "reply":
        setReplyTo({ id, name: m.author === "me" ? "You" : chat.name, text: m.text ?? (m.voice ? "Voice message" : "Attachment") });
        break;
      case "copy":
        if (m.text) { navigator.clipboard?.writeText(m.text); toast.success("Copied"); }
        break;
      case "pin":
        setMessages(prev => prev.map(x => x.id === id ? { ...x, pinned: !x.pinned } : x));
        toast.success(m.pinned ? "Unpinned" : "Pinned");
        break;
      case "edit":
        if (m.author === "me" && m.text) setEditing({ id, text: m.text });
        break;
      case "delete-me":
        setMessages(prev => prev.filter(x => x.id !== id));
        toast.success("Deleted");
        break;
      case "delete-all":
        setMessages(prev => prev.map(x => x.id === id ? { ...x, deleted: true, text: undefined, voice: undefined, attachments: undefined, reactions: undefined } : x));
        toast.success("Deleted for everyone");
        break;
      case "forward":
      case "share":
        toast(a === "forward" ? "Forward…" : "Share…");
        break;
      case "info":
        toast(m.author === "me" ? `Status: ${m.status ?? "sent"}` : `Received ${m.time}`);
        break;
      case "select":
        toast("Multi-select coming");
        break;
    }
  };

  const commitEdit = (text: string) => {
    if (!editing) return;
    setMessages(prev => prev.map(x => x.id === editing.id ? { ...x, text, edited: true } : x));
    setEditing(null);
    sfx.tap();
  };

  const onMenuAction = (label: string) => {
    if (label === "Search in chat") { setSearching(true); return; }
    if (label === "Media, links & files") { setMediaHub(true); return; }
    toast(label);
  };

  return (
    <div className="bg-cryptvora flex h-[100dvh] flex-col font-display">
      <AnimatePresence mode="wait">
        {searching ? (
          <SearchBar
            key="search"
            query={query}
            onQuery={setQuery}
            count={hits.length}
            index={hitIdx}
            onPrev={() => setHitIdx(i => (i - 1 + hits.length) % Math.max(1, hits.length))}
            onNext={() => setHitIdx(i => (i + 1) % Math.max(1, hits.length))}
            onClose={() => { setSearching(false); setQuery(""); }}
          />
        ) : (
          <ChatHeader
            key="header"
            name={chat.name}
            status={chat.online ? "online" : "last seen recently"}
            avatarSeed={chat.avatarSeed}
            online={chat.online}
            onSearch={() => setSearching(true)}
            onMenuAction={onMenuAction}
          />
        )}
      </AnimatePresence>

      <div ref={scrollerRef} className="scroll-fade flex-1 space-y-1.5 overflow-y-auto py-3">
        <DateChip label="Today" />
        {messages.map((m) => {
          const isNew = !seenIds.current.has(m.id);
          if (isNew) seenIds.current.add(m.id);
          const active = query && hits[hitIdx] === m.id;
          return (
            <div id={`msg-${m.id}`} key={m.id}>
              <MessageItem m={m} initial={isNew} query={query} active={!!active} onReact={handleReact} onAction={handleAction} />
            </div>
          );
        })}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-start px-3"
            >
              <div className="bg-bubble-in flex items-center gap-1 rounded-[22px] rounded-bl-[8px] px-4 py-3 ring-1 ring-white/5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                    animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Composer
        onSend={handleSend}
        onVoice={handleVoice}
        onAttachments={handleAttachments}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
        onCommitEdit={commitEdit}
        replyTo={replyTo ? { name: replyTo.name, text: replyTo.text } : null}
        onCancelReply={() => setReplyTo(null)}
      />

      <MediaHub open={mediaHub} messages={messages} onClose={() => setMediaHub(false)} />
    </div>
  );
}

function DateChip({ label }: { label: string }) {
  return (
    <div className="sticky top-2 z-10 flex justify-center">
      <span className="glass rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function replyFor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("btc") || t.includes("chart")) return "Same read. Waiting for the LTF confirmation before I add.";
  if (t.length < 12) return "Copy that. 👌";
  return "Noted. Let me know when your invalidation shifts.";
}
