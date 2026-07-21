import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChatList } from "@/components/chat-list";
import { ChatThread } from "@/components/chat/ChatThread";
import { InfoPanel } from "@/components/conversation";
import { chats } from "@/lib/mock-data";

export const Route = createFileRoute("/chat/$id")({
  head: ({ params }) => {
    const chat = chats.find((c) => c.id === params.id);
    return {
      meta: [
        { title: chat ? `${chat.name} — Hoox` : "Chat — Hoox" },
        {
          name: "description",
          content: chat?.lastMessage ?? "Private conversation on Hoox.",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const chat = chats.find((c) => c.id === params.id);
    if (!chat) throw notFound();
    return { chat };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Conversation not found.</div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">Couldn't load this chat.</p>
      <button
        onClick={reset}
        className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        Retry {error?.name}
      </button>
    </div>
  ),
  component: ChatDetail,
});

function ChatDetail() {
  const { chat } = Route.useLoaderData();
  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)_320px]">
      {/* Chat list — hidden on mobile when a chat is open */}
      <section className="hidden border-r border-border lg:block lg:h-screen lg:overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Chats</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">14 unread</p>
          </div>
        </div>
        <div className="h-[calc(100vh-73px)] overflow-y-auto">
          <ChatList activeId={chat.id} />
        </div>
      </section>

      <section className="lg:h-screen lg:overflow-hidden xl:mr-0">
        <ChatThread chat={chat} />
      </section>

      <InfoPanel chat={chat} />
    </div>
  );
}
