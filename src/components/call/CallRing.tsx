import { motion } from "framer-motion";

/** The twin arcs echo the app's infinity-mark logo — used as an animated
 * ring around the avatar during calls. Spins slowly while ringing/dialing,
 * pulses with a soft glow once connected. */
export function CallRing({
  size,
  spinning,
  glowing,
}: {
  size: number;
  spinning: boolean;
  glowing: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {glowing && (
        <motion.div
          className="absolute rounded-full bg-white/30 blur-2xl"
          style={{ width: size * 0.9, height: size * 0.9 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        className="absolute drop-shadow-md"
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { duration: 3.5, repeat: Infinity, ease: "linear" } : {}}
      >
        <defs>
          <linearGradient id="callRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={glowing || spinning ? 0.95 : 0.5} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={glowing || spinning ? 0.5 : 0.15} />
          </linearGradient>
        </defs>
        <path d="M 43 12 A 38 38 0 1 0 43 88" fill="none" stroke="url(#callRingGrad)" strokeWidth="5" strokeLinecap="round" />
        <path d="M 57 12 A 38 38 0 1 1 57 88" fill="none" stroke="url(#callRingGrad)" strokeWidth="5" strokeLinecap="round" />
      </motion.svg>
    </div>
  );
}
