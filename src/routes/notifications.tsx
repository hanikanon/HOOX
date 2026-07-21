import { createFileRoute } from "@tanstack/react-router";
import { notifications } from "@/lib/mock-data";
import { AtSign, MessageCircle, UserPlus, Ticket, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Hoox" }] }),
  component: NotificationsPage,
});

const iconMap = {
  mention: AtSign,
  reply: MessageCircle,
  follow: UserPlus,
  invite: Ticket,
  course: GraduationCap,
};

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Notifications
        </h1>
        <button className="text-[12px] text-primary hover:underline">
          Mark all read
        </button>
      </header>

      <ul className="space-y-2">
        {notifications.map((n) => {
          const Icon = iconMap[n.kind];
          return (
            <li
              key={n.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface/40 p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[14px] font-semibold">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {n.time}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {n.body}
                </p>
              </div>
              <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
