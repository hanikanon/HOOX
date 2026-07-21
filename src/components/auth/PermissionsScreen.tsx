import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic, Video, Bell, ChevronRight } from "lucide-react";
import { OwlMark } from "@/components/logo";
import { initOneSignal } from "@/lib/onesignal";

interface PermissionsScreenProps {
  onContinue: () => void;
}

/** Asking for microphone/camera access the first time someone actually
 * starts a call is the standard web pattern — but on Android, that also
 * means the OS permission dialog interrupts them mid-action. Requesting
 * everything once, upfront, with a plain explanation, means calls and
 * notifications just work later without an extra interruption. Denying
 * here doesn't lock anyone out — the browser/OS will simply ask again
 * naturally the first time a call actually needs it. */
export function PermissionsScreen({ onContinue }: PermissionsScreenProps) {
  const reduce = useReducedMotion();
  const [requesting, setRequesting] = useState(false);
  const ease = [0.22, 1, 0.36, 1] as const;

  const handleAllow = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      // Requesting audio+video together triggers both the microphone and
      // camera OS permission prompts in one go. Stop the tracks right
      // away — this call exists purely to trigger the permission dialog,
      // not to actually keep the mic/camera on.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // Denied or unavailable — that's fine, the person can still use the
      // app; calls will just prompt again naturally when actually started.
    }
    try {
      await initOneSignal();
    } catch {
      // Same — notifications are a bonus, not a requirement.
    }
    onContinue();
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-between overflow-hidden bg-background px-6 pb-10 pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease }}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <OwlMark size={92} />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
          A couple of quick permissions
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Hoox needs these to make calls and messages work properly.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-3">
        <PermissionRow
          icon={<Mic className="size-5" />}
          title="Microphone"
          description="So the other person can hear you on calls"
        />
        <PermissionRow
          icon={<Video className="size-5" />}
          title="Camera"
          description="For video calls"
        />
        <PermissionRow
          icon={<Bell className="size-5" />}
          title="Notifications"
          description="So you don't miss calls and messages when the app is closed"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <button
          type="button"
          onClick={() => void handleAllow()}
          disabled={requesting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {requesting ? "One sec…" : "Continue"}
          {!requesting && <ChevronRight className="size-4" />}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Your device will ask you to confirm each one.
        </p>
      </div>
    </motion.div>
  );
}

function PermissionRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/5 px-4 py-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
