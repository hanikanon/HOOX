import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell, usePageTransitionDirection, SWIPE_TABS } from "../components/app-shell";
import { ThemeProvider } from "../hooks/use-theme";
import { CallProvider } from "../hooks/use-call";
import { CallOverlay } from "../components/call/CallOverlay";
import { WelcomeScreen } from "../components/auth/WelcomeScreen";
import { PermissionsScreen } from "../components/auth/PermissionsScreen";
import { watchAuthState, getUserProfile, ensureUserProfile, ensureDeviceCode, completeSignIn } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has flown off into the night.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Hoox
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Something didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The night is long. Try again or head back to your chats.
        </p>
        {/* Temporary — shows the real error text so it can be screenshotted
         * and diagnosed, instead of only ever seeing this generic message. */}
        <p className="mt-3 break-words rounded-lg bg-white/5 p-3 text-left text-[11px] text-muted-foreground/80">
          {error?.message || String(error)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { name: "theme-color", content: "#000000" },
      { title: "Hoox — Premium community for traders" },
      {
        name: "description",
        content:
          "Hoox is a private, premium community platform built for traders. Group chats, channels, courses and memberships in one calm AMOLED experience.",
      },
      { name: "author", content: "Hoox" },
      { property: "og:title", content: "Hoox — Premium community for traders" },
      {
        property: "og:description",
        content:
          "A private members-only community for high-conviction crypto traders. Chats, channels, courses, and calm signal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hoox — Premium community for traders" },
      {
        name: "twitter:description",
        content: "Private, premium community platform for traders.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const direction = usePageTransitionDirection(path);
  const isChatThread = path.startsWith("/chat/");
  const isSwipeTab = (SWIPE_TABS as readonly string[]).includes(path);
  const xOffset = direction === "right" ? 28 : direction === "left" ? -28 : 0;

  // Was the *previous* screen a conversation? Needed so the chat list can
  // tell "closing a conversation" apart from a normal tab switch — it should
  // sit perfectly still in both directions of that specific transition, with
  // only the conversation layer itself moving. Scoped to this pairing only;
  // every other route keeps its existing transition untouched below.
  const prevPathRef = useRef(path);
  const cameFromThread = prevPathRef.current.startsWith("/chat/") && !isChatThread;
  useEffect(() => {
    prevPathRef.current = path;
  }, [path]);

  // Same expo-out curve used throughout the Settings screens — this specific
  // curve (fast start, long soft landing, no overshoot) is what reads as
  // "native app" rather than "web page fading in". Using it everywhere a
  // route changes keeps the whole app feeling like one consistent platform.
  const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

  // Real sign-in gate: a person is "in" once Supabase confirms an actual
  // Google-verified session (see lib/auth.ts) and has a saved `profiles`
  // row. Supabase persists the session on-device on its own, so returning
  // users skip straight to "app" without picking Google again.
  const [authStage, setAuthStage] = useState<"checking" | "welcome" | "permissions" | "app">(
    "checking",
  );

  useEffect(() => {
    const unsubscribe = watchAuthState((user) => {
      if (!user) {
        setAuthStage((current) => (current === "app" ? current : "welcome"));
        return;
      }
      getUserProfile(user.id)
        .then(async (existing) => {
          if (existing) {
            await ensureDeviceCode(existing).catch(() => {
              // Not fatal — they just won't be reachable for chat/calls
              // until this succeeds on a later launch.
            });
            setAuthStage("app");
            return;
          }
          await ensureUserProfile(user);
          setAuthStage("permissions");
        })
        .catch(() => {
          // Couldn't reach Supabase to check — fall back to the welcome
          // screen rather than getting stuck on "checking".
          setAuthStage((current) => (current === "app" ? current : "welcome"));
        });
    });
    return unsubscribe;
  }, []);

  // Catches the "hoox://login-callback" redirect once the person finishes
  // the Google consent screen in the system browser (see
  // lib/auth.ts:signInWithGoogle) and hands the URL off to Supabase to
  // finish signing them in. The watchAuthState effect above then picks up
  // the resulting session on its own.
  useEffect(() => {
    let removeListener: { remove: () => void } | undefined;
    import("@capacitor/app").then(({ App }) => {
      App.addListener("appUrlOpen", ({ url }) => {
        if (url.startsWith("hoox://login-callback")) {
          completeSignIn(url).catch(() => {
            // Nothing to do here beyond leaving them on the welcome screen —
            // signInWithGoogle()'s own promise already rejects with a
            // user-facing message.
          });
        }
      }).then((handle) => {
        removeListener = handle;
      });
    });
    return () => removeListener?.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <ThemeProvider>
        {authStage === "checking" ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-background" />
        ) : authStage !== "app" ? (
          <AnimatePresence mode="wait" initial={false}>
            {authStage === "welcome" ? (
              <WelcomeScreen key="welcome" />
            ) : (
              <PermissionsScreen key="permissions" onContinue={() => setAuthStage("app")} />
            )}
          </AnimatePresence>
        ) : (
        <CallProvider>
        <CallOverlay />
        <AppShell>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            {isChatThread ? (
              // The conversation is a real layer stacked above the chat
              // list: it slides fully in from the right on open and fully
              // back out to the right on close/back, at all times covering
              // (never blending or fading with) whatever is underneath —
              // the classic Telegram push/pop feel.
              <motion.div
                key={path}
                className="absolute inset-0 z-20 bg-background"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.28, ease: EASE }}
                style={{ willChange: "transform" }}
              >
                <Outlet />
              </motion.div>
            ) : isSwipeTab && cameFromThread ? (
              // Chat list reappearing after a conversation closes: it was
              // never actually animating (it sat still the whole time,
              // underneath) — no entrance here, or it would look like a
              // second, competing motion on top of the conversation's own
              // slide-out. This preserves its scroll position too, since it
              // isn't being treated as a fresh transition.
              <motion.div key={path} initial={false} animate={{ opacity: 1, x: 0 }}>
                <Outlet />
              </motion.div>
            ) : isSwipeTab ? (
              // The drag gesture animates position/opacity itself while a
              // finger is down — this only covers *programmatic* nav (tapping
              // the bottom bar), so it stays light, but now nudges in the
              // same direction as a swipe would, with the same curve, instead
              // of a flat fade-only pop.
              <motion.div
                key={path}
                custom={direction}
                initial={{ opacity: 0, x: xOffset * 0.6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -xOffset * 0.35 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <Outlet />
              </motion.div>
            ) : (
              <motion.div
                key={path}
                initial={{ opacity: 0, x: xOffset, y: xOffset === 0 ? 10 : 0, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -xOffset * 0.5, y: xOffset === 0 ? -6 : 0, scale: 0.985 }}
                transition={{ duration: 0.26, ease: EASE }}
                style={{ willChange: "transform, opacity" }}
              >
                <Outlet />
              </motion.div>
            )}
          </AnimatePresence>
        </AppShell>
        </CallProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
