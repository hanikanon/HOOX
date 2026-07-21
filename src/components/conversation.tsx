import { Avatar } from "@/components/avatar";
import { VerificationBadge } from "@/components/verification-badge";
import type { Chat } from "@/lib/mock-data";

export function InfoPanel({ chat }: { chat: Chat }) {
  const media = Array.from({ length: 6 });
  return (
    <aside className="hidden xl:flex fixed inset-y-0 right-0 w-[320px] flex-col border-l border-border bg-sidebar/70 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">Info</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Manage
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center text-center">
          <Avatar
            seed={chat.avatarSeed}
            name={chat.name}
            size={96}
            isOwl={chat.avatarSeed === "owl"}
            ring
          />
          <div className="mt-4 flex items-center gap-1.5">
            <h4 className="text-lg font-semibold tracking-tight">{chat.name}</h4>
            {chat.verified && <VerificationBadge tier={chat.badge ?? "verified"} size={16} />}
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {chat.members
              ? `${chat.members.toLocaleString()} members`
              : chat.online
                ? "Online"
                : "Last seen recently"}
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-foreground/70">
            A private members-only circle for high-conviction crypto traders. Alpha,
            structure, and calm signal.
          </p>
          <div className="mt-5 flex w-full gap-2">
            <button className="flex-1 rounded-xl bg-surface/60 py-2 text-[12px] font-medium ring-1 ring-border hover:bg-surface">
              Mute
            </button>
            <button className="flex-1 rounded-xl bg-surface/60 py-2 text-[12px] font-medium ring-1 ring-border hover:bg-surface">
              Search
            </button>
            <button className="flex-1 rounded-xl bg-primary py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">
              Invite
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Pinned
            </h5>
            <span className="text-[10px] text-muted-foreground">3</span>
          </div>
          <div className="rounded-2xl bg-surface/50 p-3 ring-1 ring-border">
            <p className="text-[12px] font-semibold">Weekly playbook</p>
            <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
              Read pinned rules before posting setups. Chart + thesis + invalidation.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Shared Media
            </h5>
            <button className="text-[11px] text-primary hover:underline">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {media.map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg ring-1 ring-border"
                style={{
                  background: `linear-gradient(${135 + i * 20}deg, oklch(0.35 0.18 ${280 + i * 8}), oklch(0.15 0.05 ${280 + i * 12}))`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Members
            </h5>
            <span className="text-[10px] text-muted-foreground">
              {chat.members?.toLocaleString() ?? 0}
            </span>
          </div>
          <ul className="space-y-1">
            {["Julian Reyes", "Amir K.", "Elena Vance", "Marcus V.", "Sarah J."].map(
              (name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.03]"
                >
                  <Avatar seed={name} name={name} size={36} online={i < 2} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {i === 0 ? "Admin" : i === 1 ? "Moderator" : "Member"}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}
