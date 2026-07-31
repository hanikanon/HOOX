import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { subscribeToDirectMessages, sendDirectMessage, type DirectMessage } from "@/lib/messaging";
import { getOrCreateDeviceCode } from "@/lib/device-code";

export const Route = createFileRoute("/dm/$code")({
  head: ({ params }) => ({
    meta: [{ title: `${params.code} — Hoox` }],
  }),
  component: DirectMessageScreen,
});

function formatTime(d: Date | null) {
  if (!d) return "sending…";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DirectMessageScreen() {
  const { code } = Route.useParams();
  const myCode = getOrCreateDeviceCode();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToDirectMessages(code, setMessages);
    return unsubscribe;
  }, [code]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText("");
    setSending(true);
    try {
      await sendDirectMessage(code, trimmed);
    } catch {
      // Leave it simple for now — the person can just try sending again.
      // A future pass could restore the draft text and show a retry hint.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link to="/" className="grid size-8 place-items-center rounded-full hover:bg-white/[0.06]">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-sm font-semibold tracking-[0.1em]">{code}</p>
          <p className="text-[11px] text-muted-foreground">Direct message · real & persistent</p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No messages yet — say hi to {code}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderCode === myCode;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-white/10 text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Message"
          className="h-11 flex-1 rounded-full border border-border bg-white/5 px-4 text-sm outline-none focus:border-primary focus:bg-white/10"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!text.trim() || sending}
          className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
