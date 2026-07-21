import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Play,
  Repeat2,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { StoriesBar } from "@/components/stories";
import { feed, trendingTopics, type FeedItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Hoox" },
      {
        name: "description",
        content:
          "Featured news, verified analyst posts, market updates and educational videos from the Hoox community.",
      },
      { property: "og:title", content: "Feed — Hoox" },
      {
        property: "og:description",
        content:
          "The premium feed for traders — signals, analyst posts, and market moves.",
      },
    ],
  }),
  component: FeedPage,
});

function ChartPreview() {
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-background">
      <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 300)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 300)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 L40,110 L70,118 L110,90 L150,102 L190,72 L230,84 L270,54 L310,66 L350,38 L400,48 L400,160 L0,160 Z"
          fill="url(#fg)"
        />
        <path
          d="M0,120 L40,110 L70,118 L110,90 L150,102 L190,72 L230,84 L270,54 L310,66 L350,38 L400,48"
          fill="none"
          stroke="oklch(0.78 0.18 300)"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/70 px-2 py-1 text-[10px] font-semibold text-foreground/90 backdrop-blur">
        <TrendingUp className="size-3 text-success" />
        BTC/USD · +3.24%
      </div>
    </div>
  );
}

function VideoPreview({ title }: { title?: string }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-background to-background">
      <div className="absolute inset-0 grid place-items-center">
        <button className="grid size-14 place-items-center rounded-full bg-white/95 text-background shadow-xl backdrop-blur transition-transform hover:scale-105">
          <Play className="size-6 fill-current" />
        </button>
      </div>
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
          <p className="text-[13px] font-semibold">{title}</p>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const isFeatured = item.kind === "featured";
  return (
    <article
      className={cn(
        "rounded-3xl border p-4 transition-colors sm:p-5",
        isFeatured
          ? "border-primary/30 bg-gradient-to-br from-primary/10 via-surface/60 to-background ring-1 ring-primary/20"
          : "border-border bg-surface/40 hover:bg-surface/60",
      )}
    >
      {item.pinned && (
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Pin className="size-3" />
          Pinned by Hoox
        </div>
      )}
      <header className="flex items-start gap-3">
        <Avatar seed={item.seed} name={item.author} size={44} isOwl={item.seed === "owl"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-semibold">{item.author}</p>
            {item.verified && <VerificationBadge tier={item.badge ?? "verified"} size={16} />}
            <span className="truncate text-[12px] text-muted-foreground">
              {item.handle} · {item.time}
            </span>
          </div>
          {item.tag && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {item.kind === "featured" && <Sparkles className="size-3" />}
              {item.tag}
            </span>
          )}
        </div>
        <button className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      <div className="mt-3 space-y-3">
        {item.title && (
          <h3
            className={cn(
              "font-semibold tracking-tight",
              isFeatured ? "text-xl leading-snug" : "text-[16px] leading-snug",
            )}
          >
            {item.title}
          </h3>
        )}
        <p className="text-[14px] leading-relaxed text-foreground/85">{item.body}</p>
        {item.media === "chart" && <ChartPreview />}
        {item.media === "video" && <VideoPreview title={item.title} />}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1">
          <button className="group flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">
            <Heart className="size-4 group-hover:text-destructive" />
            {item.likes.toLocaleString()}
          </button>
          <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">
            <MessageCircle className="size-4" />
            {item.comments}
          </button>
          <button className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground sm:flex">
            <Repeat2 className="size-4" />
            {item.shares}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">
            <Share2 className="size-4" />
          </button>
          <button className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">
            <Bookmark className="size-4" />
          </button>
        </div>
      </footer>
    </article>
  );
}

function FeedPage() {
  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="lg:h-screen lg:overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Feed</h1>
              <p className="text-[11px] text-muted-foreground">
                Signal from the community, curated by the desk.
              </p>
            </div>
            <div className="flex gap-2">
              {["For you", "Analysts", "News"].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface/60 text-muted-foreground ring-1 ring-border hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <StoriesBar />

        <div className="space-y-3 p-4 pb-24 lg:space-y-4 lg:p-6 lg:pb-8">
          {feed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Right rail */}
      <aside className="hidden border-l border-border lg:block lg:h-screen lg:overflow-y-auto">
        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-border bg-surface/50 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <TrendingUp className="size-3.5" />
              Trending Now
            </div>
            <ul className="mt-3 space-y-2">
              {trendingTopics.map((t) => (
                <li key={t.tag}>
                  <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]">
                    <span className="text-[14px] font-semibold">{t.tag}</span>
                    <span className="text-[11px] text-muted-foreground">{t.posts}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Premium Alpha
            </div>
            <p className="mt-2 text-[14px] font-semibold leading-snug">
              Unlock verified analyst rooms, live trade tape, and pro courses.
            </p>
            <button className="mt-3 w-full rounded-xl bg-primary py-2 text-[13px] font-semibold text-primary-foreground shadow-glow hover:bg-primary/90">
              Upgrade now
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
