import { motion, useReducedMotion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { OwlMark } from "@/components/logo";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const ease = [0.22, 1, 0.36, 1] as const;
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease },
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 650);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onContinue();
    }, 900);
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-between overflow-hidden bg-background px-6 pb-10 pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: reduce ? 0 : -30 }}
      transition={{ duration: reduce ? 0 : 0.45, ease }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[image:radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div {...fadeUp(0)}>
          <OwlMark size={132} />
        </motion.div>
        <motion.h1
          className="mt-8 text-4xl font-bold tracking-tight text-white"
          {...fadeUp(0.18)}
        >
          Hoox
        </motion.h1>
        <motion.p
          className="mt-3 max-w-xs text-center text-[15px] leading-relaxed text-gray-400"
          {...fadeUp(0.32)}
        >
          Welcome to Hoox — secure messaging powered by Google Authentication.
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: reduce ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.5, ease }}
      >
        <motion.button
          onClick={handleClick}
          disabled={loading}
          whileHover={
            reduce || loading
              ? undefined
              : { scale: 1.015, boxShadow: "0 0 30px color-mix(in oklab, var(--primary) 35%, transparent)" }
          }
          whileTap={reduce || loading ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-6 py-4 text-lg font-medium text-gray-900 shadow-xl shadow-primary/10 transition-shadow disabled:cursor-not-allowed"
        >
          {ripples.map((r) => (
            <span
              key={r.id}
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25"
              style={{ left: r.x, top: r.y, animation: "cv-ripple 600ms ease-out forwards" }}
            />
          ))}
          {loading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-gray-700" />
              <span>Signing you in…</span>
            </>
          ) : (
            <>
              <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </motion.button>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4 text-primary" />
          <span>Secure authentication powered by Google</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
          <button className="transition-colors hover:text-white">Privacy Policy</button>
          <span>•</span>
          <button className="transition-colors hover:text-white">Terms of Service</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
