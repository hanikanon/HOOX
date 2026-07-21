import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/memberships")({
  head: () => ({ meta: [{ title: "Memberships — Hoox" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <div className="rounded-3xl border border-primary/25 bg-primary/[0.06] p-8 text-center ring-1 ring-primary/20 shadow-glow">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/20 text-primary">
          <Crown className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Memberships</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Manage your subscriptions, billing, and access tiers in one place.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          View plans
        </Link>
      </div>
    </div>
  ),
});
