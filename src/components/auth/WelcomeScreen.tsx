import { motion, useReducedMotion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { OwlMark } from "@/components/logo";
import { signInWithGoogle } from "@/lib/auth";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.4 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.4C41.5 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export function WelcomeScreen() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ease = [0.22, 1, 0.36, 1] as const;
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease },
  });

  // Note: we don't need to navigate anywhere on success — __root.tsx is
  // listening for the Firebase auth state change and moves on by itself
  // the moment signInWithGoogle() resolves.
  const handleGoogle = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-between overflow-hidden bg-background px-6 pb-10 pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: reduce ? 0 : -30 }}
      transition={{ duration: reduce ? 0 : 0.45, ease }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[image:radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div {...fadeUp(0)}>
          <OwlMark size={132} />
        </motion.div>
        <motion.h1 className="mt-8 text-4xl font-bold tracking-tight text-white" {...fadeUp(0.18)}>
          Hoox
        </motion.h1>
        <motion.p className="mt-3 max-w-xs text-center text-[15px] leading-relaxed text-gray-400" {...fadeUp(0.32)}>
          Sign in with Google to continue.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.5, ease }}
      >
        {error && <p className="mb-3 text-center text-sm text-red-400">{error}</p>}

        <motion.button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          whileHover={reduce || loading ? undefined : { scale: 1.015 }}
          whileTap={reduce || loading ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-lg font-medium text-gray-900 shadow-xl shadow-black/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <GoogleG />
              <span>Continue with Google</span>
            </>
          )}
        </motion.button>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>We only use your Google account to sign you in</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
