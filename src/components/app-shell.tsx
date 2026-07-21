import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  MessageSquareText,
  GraduationCap,
  User,
  Search,
  Bell,
  Settings,
  Crown,
  Plus,
  Bookmark,
  Newspaper,
  UserPlus,
  Camera,
  PenSquare,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo, OwlMark } from "@/components/logo";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

interface NavItem {
  to: string;
  label: string;
  icon: typeof MessageSquareText;
  badge?: number;
}

const primaryNav: NavItem[] = [
  { to: "/", label: "Chats", icon: MessageSquareText, badge: 14 },
  { to: "/feed", label: "Feed", icon: Newspaper },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
];

const mobileNav: NavItem[] = [
  { to: "/", label: "Chats", icon: MessageSquareText },
  { to: "/feed", label: "Feed", icon: Newspaper },
  { to: "/profile", label: "Profile", icon: User },
];

const secondaryNav: NavItem[] = [
  { to: "/search", label: "Search", icon: Search },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: 4 },
  { to: "/memberships", label: "Memberships", icon: Crown },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

function useActivePath() {
  return useRouterState({ select: (r) => r.location.pathname });
}

function isActive(path: string, current: string) {
  if (path === "/") return current === "/" || current.startsWith("/chat");
  return current === path || current.startsWith(path + "/");
}

// The set of top-level tabs that participate in swipe navigation, in the
// order they sit on screen. Chats owns "/" and every "/chat/:id" route so a
// swipe away from an open conversation returns to the tab bar naturally.
export const SWIPE_TABS = ["/", "/feed", "/profile"] as const;

export function swipeIndexForPath(path: string): number {
  if (path === "/" || path.startsWith("/chat")) return 0;
  const idx = SWIPE_TABS.findIndex((p) => p !== "/" && path.startsWith(p));
  return idx;
}

/**
 * Tracks which direction (left/right) the active tab changed relative to the
 * previous one, so the newly mounted page can play a matching directional
 * entrance animation instead of a generic fade. Returns null for
 * non-tab routes (settings, search, a fresh app load, ...).
 */
export function usePageTransitionDirection(current: string) {
  const prevIndex = useRef(swipeIndexForPath(current));
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const idx = swipeIndexForPath(current);
    if (idx !== -1 && prevIndex.current !== -1 && idx !== prevIndex.current) {
      setDirection(idx > prevIndex.current ? "right" : "left");
    } else {
      setDirection(null);
    }
    if (idx !== -1) prevIndex.current = idx;
  }, [current]);

  return direction;
}

function DesktopRail() {
  const current = useActivePath();
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col border-r border-border bg-sidebar/95 backdrop-blur-xl">
      <div className="px-5 pt-6 pb-4">
        <Logo subtitle="Premium Alpha" />
      </div>

      <div className="px-3">
        <Link
          to="/search"
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="flex-1">Search Hoox</span>
          <kbd className="hidden xl:inline-flex items-center rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </Link>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Community
        </p>
        <ul className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(item.to, current);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-primary/12 ring-1 ring-primary/25"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid size-8 place-items-center rounded-lg transition-colors",
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-white/[0.03] text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/[0.06] text-muted-foreground",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Personal
        </p>
        <ul className="space-y-0.5">
          {secondaryNav.map((item) => {
            const active = isActive(item.to, current);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile pill */}
      <div className="border-t border-border p-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl bg-surface/60 p-2 ring-1 ring-border transition-colors hover:bg-surface"
        >
          <OwlMark size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Nightowl</p>
            <p className="truncate text-[11px] text-muted-foreground">Premium · Online</p>
          </div>
          <Settings className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isChats = path === "/";

  if (!isChats) {
    if (path.startsWith("/chat/")) return null; // conversation has its own header
    // Clean, minimal header everywhere except the Chats home page.
    const title = primaryNav.find((n) => n.to === path)?.label ?? "Hoox";
    return (
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur-xl">
        <h1 className="text-[17px] font-semibold tracking-tight">{title}</h1>
        <OwlMark size={28} />
      </header>
    );
  }

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur-xl">
      <Logo size={32} subtitle="Premium Alpha" />
      <div className="flex items-center gap-2">
        <Link
          to="/search"
          className="grid size-10 place-items-center rounded-full bg-surface/60 ring-1 ring-border transition-colors hover:bg-surface"
        >
          <Search className="size-[18px] text-muted-foreground" />
        </Link>
        <Link
          to="/notifications"
          className="relative grid size-10 place-items-center rounded-full bg-surface/60 ring-1 ring-border transition-colors hover:bg-surface"
        >
          <Bell className="size-[18px] text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
        </Link>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const current = useActivePath();
  // Hide on mobile inside a conversation
  if (current.startsWith("/chat/")) return null;

  return <ComposeFab />;
}

const composeActions: { to: string; label: string; icon: typeof Plus; hint: string }[] = [
  { to: "/", label: "New Chat", icon: UserPlus, hint: "Start a private conversation" },
  { to: "/feed", label: "New Story", icon: Camera, hint: "Share a signal or update" },
  { to: "/feed", label: "New Post", icon: PenSquare, hint: "Publish to the feed" },
];

const gridContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};
const gridItemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.85 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 340, damping: 24, mass: 0.7 },
  },
};
const sheetSpring = { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.85 };

function ComposeFab() {
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const current = useRouterState({ select: (r) => r.location.pathname });
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  useEffect(() => {
    setOpen(false);
    setNavOpen(false);
  }, [current]);
  useEffect(() => {
    if (!open && !navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, navOpen]);

  if (current.startsWith("/chat/")) return null;

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      if (navigator.vibrate) navigator.vibrate(10);
      setOpen(false);
      setNavOpen(true);
    }, 420);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };
  const onTap = () => {
    if (longPressed.current) return; // long-press already handled it
    setNavOpen(false);
    setOpen((v) => !v);
  };

  const anyOpen = open || navOpen;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {anyOpen && (
          <motion.button
            aria-hidden
            onClick={() => {
              setOpen(false);
              setNavOpen(false);
            }}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Compose action sheet (tap) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={sheetSpring}
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 152px)" }}
            className="lg:hidden fixed right-4 z-40 w-[240px] origin-bottom-right"
          >
            <div className="glass-strong overflow-hidden rounded-2xl shadow-elevate">
              {composeActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label + i}
                    to={a.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 border-b border-border/60 px-3.5 py-3 last:border-b-0 active:bg-white/[0.04]"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-foreground">
                        {a.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {a.hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation grid (long-press) */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={sheetSpring}
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 152px)" }}
            className="lg:hidden fixed inset-x-4 z-40 origin-bottom"
          >
            <div className="glass-strong rounded-3xl p-4 shadow-elevate">
              <p className="px-1 pb-3 text-[12px] font-semibold tracking-wide text-muted-foreground">
                Go to
              </p>
              <motion.div
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 gap-3"
              >
                {mobileNav.map((item) => {
                  const active = isActive(item.to, current);
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.to} variants={gridItemVariants}>
                      <Link
                        to={item.to}
                        onClick={() => setNavOpen(false)}
                        className="flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 active:scale-95"
                      >
                        <motion.span
                          whileTap={{ scale: 0.88 }}
                          className={cn(
                            "grid size-12 place-items-center rounded-2xl transition-colors",
                            active
                              ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--primary)_65%,transparent)]"
                              : "bg-white/[0.06] text-foreground",
                          )}
                        >
                          <Icon className="size-[22px]" />
                        </motion.span>
                        <span className={cn("text-[11px] font-semibold", active ? "text-primary" : "text-foreground")}>
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button — tap to compose, long-press to navigate */}
      <motion.button
        type="button"
        onClick={onTap}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={open ? "Close compose menu" : "Open compose menu — hold to navigate"}
        aria-expanded={anyOpen}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0, scale: anyOpen ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="glow-pulse lg:hidden fixed right-4 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-b from-primary to-[color-mix(in_oklab,var(--primary)_78%,black)] text-primary-foreground shadow-[0_0_28px_6px_color-mix(in_oklab,var(--primary)_45%,transparent),0_14px_32px_-10px_color-mix(in_oklab,var(--primary)_55%,transparent)] ring-1 ring-white/10"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
      >
        {open ? <X className="size-6" /> : <Plus className="size-6" />}
      </motion.button>
    </>
  );
}

// Subtle, tasteful per-page "personality" while dragging — never enough to
// feel like a different design language, just a slightly different weight.
//   Chats:   calm & stable   → minimal parallax/scale, holds its composure
//   Feed:    dynamic & alive → a touch more parallax and a livelier fade
//   Groups/Channels: a light middle ground
//   Profile: elegant & refined → softer, slower-feeling fade, least motion
const PAGE_IDENTITY: Record<string, { parallax: number; fade: number; lift: number }> = {
  "/": { parallax: 0.02, fade: 0.4, lift: 0 },
  "/feed": { parallax: 0.05, fade: 0.55, lift: 6 },
  "/profile": { parallax: 0.015, fade: 0.32, lift: 0 },
};

function SwipeablePage({ children }: { children: ReactNode }) {
  const current = useActivePath();
  const navigate = useNavigate();

  const tabIndex = swipeIndexForPath(current);
  // Swipe-to-navigate has been removed — the bottom tab bar (a plain tap)
  // and the compose "+" menu are the only ways to move between pages now.
  // `useSwipeNavigation` is still called with enabled:false rather than
  // removed outright, so nothing here needs restructuring — it simply never
  // attaches its touch handlers, and dragX stays 0.
  const swipeEnabled = false;

  const { dragX, isDragging, isSettling, containerRef } = useSwipeNavigation({
    count: SWIPE_TABS.length,
    activeIndex: Math.max(0, tabIndex),
    enabled: swipeEnabled,
    onCommit: (nextIndex) => navigate({ to: SWIPE_TABS[nextIndex] }),
  });

  const width = containerRef.current?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1);
  const dragFraction = Math.min(1, Math.abs(dragX) / Math.max(1, width));
  const identity = PAGE_IDENTITY[current] ?? PAGE_IDENTITY["/"];

  // The finger (via the spring, on release) already drives `dragX` at full
  // frame rate — no CSS transition is layered on top, so there's never a
  // second animation system racing the physical one.
  const opacity = dragX ? 1 - dragFraction * identity.fade : 1;
  const scale = dragX ? 1 - dragFraction * identity.parallax : 1;
  const liftPx = dragX ? -dragFraction * identity.lift : 0;

  return (
    <div
      ref={containerRef}
      className="relative touch-pan-y"
      style={{
        transform: dragX || isSettling ? `translateX(${dragX}px) translateY(${liftPx}px) scale(${scale})` : undefined,
        opacity,
        transition: "none",
        willChange: isDragging || isSettling ? "transform, opacity" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopRail />
      <MobileTopBar />
      <main className="lg:pl-[260px] pb-[calc(env(safe-area-inset-bottom,0px)+72px)] lg:pb-0">
        <SwipeablePage>{children}</SwipeablePage>
      </main>
      <MobileBottomNav />
    </div>
  );
}
