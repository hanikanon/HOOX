import { createFileRoute } from "@tanstack/react-router";
import { ChatList } from "@/components/chat-list";
import { OwlMark } from "@/components/logo";
import { Sparkles, MessageSquareText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chats — Hoox" },
      {
        name: "description",
        content:
          "Your private chats, groups and channels on Hoox — the premium community for traders.",
      },
    ],
  }),
  component: ChatsIndex,
});

function ChatsIndex() {
  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* Chat list column */}
      <section className="border-r border-border lg:h-screen lg:overflow-hidden">
        <div className="hidden items-center justify-between border-b border-border px-5 py-4 lg:flex">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Chats</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              14 unread · 3 mentions
            </p>
          </div>
          <button className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--primary)_70%,transparent)] hover:bg-primary/90">
            <MessageSquareText className="size-[16px]" />
          </button>
        </div>
        <div className="lg:h-[calc(100vh-73px)] lg:overflow-y-auto">
          <ChatList />
        </div>
      </section>

      {/* Empty state (desktop only) */}
      <section className="relative hidden lg:flex lg:items-center lg:justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 400px at 50% 30%, color-mix(in oklab, var(--primary) 20%, transparent), transparent)",
          }}
        />
        <div className="relative z-10 max-w-md px-6 text-center">
          <div className="mx-auto flex size-24 items-center justify-center">
            <OwlMark size={96} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome to <span className="text-gradient">Hoox</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Select a conversation to jump in, or start a new one. Signal, not noise.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-[12px] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            1,248 traders online right now
          </div>
        </div>
      </section>
    </div>
  );
}
