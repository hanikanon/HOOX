import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, TrendingUp, Hash } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { chats } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [{ title: "Search — Hoox" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const suggestions = ["ETH breakout", "Order flow", "Julian Reyes", "Alpha Circle"];
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight lg:text-3xl">Search</h1>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3 focus-within:ring-1 focus-within:ring-primary/40">
        <SearchIcon className="size-[18px] text-muted-foreground" />
        <input
          autoFocus
          type="text"
          placeholder="Search messages, traders, groups, channels, or courses…"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
          esc
        </kbd>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Trending
        </h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-3 py-1.5 text-[13px] ring-1 ring-border hover:bg-surface"
            >
              <TrendingUp className="size-3 text-primary" />
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          People & groups
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/40">
          {chats.slice(0, 5).map((c) => (
            <li key={c.id}>
              <Link
                to="/chat/$id"
                params={{ id: c.id }}
                className="flex items-center gap-3 p-3 hover:bg-white/[0.03]"
              >
                <Avatar
                  seed={c.avatarSeed}
                  name={c.name}
                  size={40}
                  isOwl={c.avatarSeed === "owl"}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <Hash className="mr-0.5 inline size-3" />
                    {c.kind}
                    {c.members && ` · ${c.members.toLocaleString()} members`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
