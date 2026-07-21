import logoUrl from "@/assets/cryptvora-logo.png";
import { cn } from "@/lib/utils";

export const OWL_URL = logoUrl;

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  subtitle?: string;
}

export function OwlMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full ring-1 ring-white/10 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img src={OWL_URL} alt="Hoox" className="h-full w-full object-cover" />
    </div>
  );
}

export function Logo({ size = 36, className, showWordmark = true, subtitle }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <OwlMark size={size} />
      {showWordmark && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] font-semibold tracking-tight leading-none">Hoox</span>
            <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-primary/20">
              <span className="size-1.5 rounded-full bg-primary" />
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
