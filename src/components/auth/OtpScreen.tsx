import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { OwlMark } from "@/components/logo";

interface OtpScreenProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const CODE_LENGTH = 6;

export function OtpScreen({ email, onVerified, onBack }: OtpScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    setError(null);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
    if (next.every((d) => d.length === 1)) submit(next.join(""));
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!t) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < t.length; i++) next[i] = t[i];
    setDigits(next);
    inputs.current[Math.min(t.length, CODE_LENGTH - 1)]?.focus();
    if (t.length === CODE_LENGTH) submit(t);
  };

  const submit = (code: string) => {
    // Mock verification: accept any 6-digit code
    if (code.length !== CODE_LENGTH) return;
    setTimeout(onVerified, 250);
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col bg-background px-6 pt-12"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <button
        onClick={onBack}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 hover:bg-white/5"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-sm flex-col items-center">
        <OwlMark size={72} className="mb-6" />
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Mail size={20} />
        </div>
        <h2 className="text-2xl font-semibold text-white">Verify your email</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          We sent a 6-digit code to
          <br />
          <span className="text-white/90">{email}</span>
        </p>

        <div className="mt-8 flex w-full items-center justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              className="h-14 w-11 rounded-2xl border border-white/10 bg-white/5 text-center text-xl font-semibold text-white outline-none transition focus:border-primary focus:bg-white/10 focus:ring-2 focus:ring-primary/40"
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          disabled={resendIn > 0}
          onClick={() => setResendIn(30)}
          className="mt-8 text-sm text-gray-400 hover:text-white disabled:opacity-60"
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Tip: enter any 6 digits to continue in this demo.
        </p>
      </div>
    </motion.div>
  );
}
