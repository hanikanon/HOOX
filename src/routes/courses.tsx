import { createFileRoute } from "@tanstack/react-router";
import { courses } from "@/lib/mock-data";
import { Clock, GraduationCap, Star, Check, Crown } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses & Memberships — Hoox" },
      {
        name: "description",
        content:
          "Premium video and PDF courses on trading, order flow, and macro — with subscription memberships.",
      },
    ],
  }),
  component: CoursesPage,
});

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "free",
    perks: ["Public chats", "Community feed", "Limited channels"],
    cta: "Current plan",
    primary: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "/mo",
    perks: [
      "All private groups",
      "Premium channels",
      "Live voice rooms",
      "Course library",
    ],
    cta: "Upgrade to Premium",
    primary: true,
    badge: "Most popular",
  },
  {
    name: "Alpha Circle",
    price: "$149",
    period: "/mo",
    perks: [
      "Everything in Premium",
      "Inner Circle access",
      "Weekly playbook",
      "1:1 monthly review",
    ],
    cta: "Apply",
    primary: false,
  },
];

function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <header className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          Hoox Academy
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          Learn from the desks that trade.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          Curated video and PDF courses, taught by verified professional traders and
          creators inside Hoox.
        </p>
      </header>

      {/* Course grid */}
      <section className="mb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <article
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface/40 transition-all hover:border-primary/40"
            >
              <div
                className="relative flex aspect-[4/3] items-end p-4"
                style={{
                  background: `linear-gradient(160deg, oklch(0.55 0.22 ${c.hue}), oklch(0.14 0.06 ${c.hue}))`,
                }}
              >
                {c.badge && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {c.badge}
                  </span>
                )}
                <GraduationCap className="size-10 text-white/85" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                  {c.tagline}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" /> {c.hours}
                  </span>
                  <span>·</span>
                  <span>{c.level}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold tracking-tight">
                    {c.price}
                  </span>
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">
                    Enroll
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Memberships */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Crown className="size-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Memberships</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-6 ${
                t.primary
                  ? "border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20 shadow-glow"
                  : "border-border bg-surface/40"
              }`}
            >
              {t.badge && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  {t.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
                {t.primary && <Star className="size-4 text-primary" />}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-[13px] text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5 text-[13px]">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/85">{p}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-xl py-2.5 text-[13px] font-semibold transition-colors ${
                  t.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-surface/80 text-foreground ring-1 ring-border hover:bg-surface"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
