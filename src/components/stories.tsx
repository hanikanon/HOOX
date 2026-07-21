import { useEffect, useRef, useState } from "react";
import { Plus, Radio, Newspaper, TrendingUp, Video, Mic, Bell, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { stories, type Story, type StoryKind } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const kindIcon: Record<StoryKind, typeof Newspaper> = {
  news: Newspaper,
  signal: TrendingUp,
  analyst: Radio,
  video: Video,
  voice: Mic,
  alert: Bell,
};

const kindLabel: Record<StoryKind, string> = {
  news: "News",
  signal: "Signal",
  analyst: "Analyst",
  video: "Video",
  voice: "Voice",
  alert: "Alert",
};

const kindGradient: Record<StoryKind, string> = {
  news: "linear-gradient(160deg, #1e293b, #0f172a)",
  signal: "linear-gradient(160deg, #064e3b, #022c22)",
  analyst: "linear-gradient(160deg, #3b1e6b, #1a0f33)",
  video: "linear-gradient(160deg, #7c2d12, #431407)",
  voice: "linear-gradient(160deg, #164e63, #083344)",
  alert: "linear-gradient(160deg, #7f1d1d, #450a0a)",
};

const STORY_DURATION = 4500;

function StoryItem({
  story,
  isSelf,
  onOpen,
}: {
  story: Story;
  isSelf?: boolean;
  onOpen: () => void;
}) {
  const Icon = kindIcon[story.kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-[76px] shrink-0 snap-start flex-col items-center gap-1.5 transition-transform duration-150 active:scale-[0.94] focus:outline-none"
    >
      <div className="relative">
        <div
          className={cn(
            "relative grid size-[68px] place-items-center rounded-full p-[2.5px] transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-95",
            story.unseen ? "story-ring" : "story-ring-viewed",
          )}
          style={
            story.unseen
              ? {
                  boxShadow:
                    "0 0 0 1px color-mix(in oklab, var(--background) 50%, transparent), 0 8px 24px -10px color-mix(in oklab, #34d399 55%, transparent)",
                }
              : undefined
          }
        >
          <div className="grid size-full place-items-center rounded-full bg-background p-[2px]">
            <Avatar
              seed={story.seed}
              name={story.author}
              size={58}
              isOwl={story.seed === "owl"}
            />
          </div>
        </div>
        {isSelf && (
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <Plus className="size-3.5" strokeWidth={3} />
          </span>
        )}
        {story.live && (
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white shadow-lg">
            LIVE
          </span>
        )}
        {!isSelf && !story.live && (
          <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-background bg-surface-2 text-primary shadow">
            <Icon className="size-3" />
          </span>
        )}
      </div>
      <p className="max-w-full truncate text-[11px] font-medium text-foreground/90">
        {isSelf ? "Your story" : story.author}
      </p>
      {!isSelf && (
        <p className="max-w-full truncate text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {kindLabel[story.kind]} · {story.time}
        </p>
      )}
    </button>
  );
}

export function StoriesBar({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className={cn("border-b border-border/60", className)}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2 lg:px-5">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">Signals & Stories</h2>
          <p className="text-[10px] text-muted-foreground">Live from the desk</p>
        </div>
        <button className="text-[11px] font-semibold text-primary hover:opacity-80">
          See all
        </button>
      </div>
      <div
        className="no-scrollbar flex snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth px-4 pb-3 lg:px-5"
        style={{ WebkitOverflowScrolling: "touch", scrollPaddingLeft: "1rem" }}
      >
        {stories.map((s, i) => (
          <StoryItem key={s.id} story={s} isSelf={i === 0} onOpen={() => setActiveIndex(i)} />
        ))}
      </div>

      {activeIndex !== null && (
        <StoryViewer
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  );
}

function StoryViewer({ startIndex, onClose }: { startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number>(Date.now());

  const story = stories[index];
  const Icon = kindIcon[story.kind];

  const goNext = () => {
    if (index >= stories.length - 1) {
      onClose();
    } else {
      setIndex((i) => i + 1);
    }
  };
  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  useEffect(() => {
    setProgress(0);
    startedAt.current = Date.now();
  }, [index]);

  useEffect(() => {
    const tick = () => {
      if (!paused) {
        const elapsed = Date.now() - startedAt.current;
        const pct = Math.min(100, (elapsed / STORY_DURATION) * 100);
        setProgress(pct);
        if (pct >= 100) {
          goNext();
          return;
        }
      } else {
        // keep "now" fresh so progress doesn't jump when resumed
        startedAt.current = Date.now() - (progress / 100) * STORY_DURATION;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-page-enter">
      <div
        className="relative flex h-full w-full max-w-[420px] flex-col overflow-hidden lg:h-[92vh] lg:rounded-3xl"
        style={{ background: kindGradient[story.kind] }}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {/* Progress segments */}
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                  transition: i === index ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 mt-6 flex items-center gap-2.5 px-4">
          <Avatar seed={story.seed} name={story.author} size={34} isOwl={story.seed === "owl"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{story.author}</p>
            <p className="text-[11px] text-white/70">
              {kindLabel[story.kind]} · {story.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white active:bg-white/20"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-white/10 text-white">
            <Icon className="size-7" />
          </span>
          <h3 className="text-2xl font-bold leading-snug text-white">{story.title}</h3>
          {story.live && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
              ● LIVE NOW
            </span>
          )}
        </div>

        {/* Tap zones */}
        <button
          aria-label="Previous story"
          onClick={goPrev}
          className="absolute inset-y-0 left-0 z-[5] flex w-1/3 items-center justify-start pl-2 text-white/0 active:text-white/40"
        >
          <ChevronLeft className="size-7" />
        </button>
        <button
          aria-label="Next story"
          onClick={goNext}
          className="absolute inset-y-0 right-0 z-[5] flex w-1/3 items-center justify-end pr-2 text-white/0 active:text-white/40"
        >
          <ChevronRight className="size-7" />
        </button>
      </div>
    </div>
  );
}
