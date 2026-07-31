import { createFileRoute, Link } from "@tanstack/react-router";
import { OwlMark } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import {
  MapPin,
  Globe,
  Settings,
  Send,
  UserPlus,
} from "lucide-react";
import {
  VerificationBadge,
  VerificationBadgeChip,
  ALL_BADGES,
} from "@/components/verification-badge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Hoox" },
      { name: "description", content: "Your Hoox trader profile." },
    ],
  }),
  component: ProfilePage,
});

const socials = [
  { label: "Telegram", handle: "@nightowl" },
  { label: "Discord", handle: "nightowl#0001" },
  { label: "TradingView", handle: "@nightowl" },
  { label: "X", handle: "@nightowl" },
];

function ProfilePage() {
  return (
    <div className="pb-24 lg:pb-0">
      {/* Cover */}
      <div className="relative h-40 overflow-hidden lg:h-56">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 400px at 20% 30%, oklch(0.4 0.22 300 / 0.55), transparent 60%), radial-gradient(500px 300px at 80% 60%, oklch(0.35 0.18 320 / 0.4), transparent 60%), oklch(0.08 0.02 280)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <Link
          to="/settings"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full glass-strong text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="size-[18px]" />
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="-mt-14 flex flex-col gap-4 lg:-mt-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="shrink-0 rounded-full ring-4 ring-background">
              <OwlMark size={104} />
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight lg:text-2xl">
                  Nightowl
                </h1>
                <VerificationBadge tier="premium-verified" size={18} />
              </div>
              <p className="truncate text-[13px] text-muted-foreground">@nightowl · Premium</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">
              <UserPlus className="size-4" /> Follow
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-4 py-2 text-[13px] font-semibold ring-1 ring-border hover:bg-surface">
              <Send className="size-4" /> Message
            </button>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-foreground/85">
          Night-shift crypto trader. Order flow, structure, and calm risk. Building
          Hoox — a private members' lounge for traders.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> Lisbon, Portugal
          </span>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <Globe className="size-3.5" /> hoox.com
          </a>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface/40 p-4 lg:max-w-md">
          {[
            { label: "Followers", value: "12.4k" },
            { label: "Following", value: "312" },
            { label: "Signals", value: "984" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-semibold tracking-tight">{s.value}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Socials */}
        <section className="mt-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Badges &amp; achievements
          </h2>
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-surface/40 p-3">
            {ALL_BADGES.map((tier) => (
              <VerificationBadgeChip key={tier} tier={tier} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Connected
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {socials.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface/40 p-3"
              >
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 truncate text-[13px] font-medium">{s.handle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shared media grid */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Shared media
            </h2>
            <button className="text-[11px] text-primary hover:underline">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl ring-1 ring-border"
                style={{
                  background: `linear-gradient(${120 + i * 12}deg, oklch(0.4 0.2 ${270 + (i * 10) % 60}), oklch(0.15 0.05 ${270 + (i * 10) % 60}))`,
                }}
              />
            ))}
          </div>
        </section>

        {/* Mutual members */}
        <section className="mt-8 mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Mutual members
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {["Julian Reyes", "Amir K.", "Elena Vance", "Marcus V."].map((n, i) => (
              <li
                key={n}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface/40 p-3"
              >
                <Avatar seed={n} name={n} size={40} online={i < 2} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{n}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {i === 0 ? "Admin · Inner Circle" : "Member"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
