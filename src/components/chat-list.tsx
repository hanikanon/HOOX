import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { RefreshCw, ShieldAlert, Users, UserPlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { getMatchedContacts, type MatchedContact } from "@/lib/contacts";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type LoadState = "idle" | "loading" | "error" | "done";

/** The real chat list: everyone from the person's address book who's also
 * on Hoox (matched by email — see lib/contacts.ts), each one a real,
 * persistent conversation (lib/messaging.ts) once you tap in. This
 * replaces the old placeholder list of made-up people and group chats. */
export function ChatList({ activeId }: { activeId?: string }) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const derivedActive = activeId ?? currentPath.match(/^\/dm\/([^/]+)/)?.[1];

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<MatchedContact[]>([]);

  const load = async () => {
    setState("loading");
    setError(null);
    try {
      const me = await getCurrentUser();
      const matched = await getMatchedContacts();
      setContacts(matched.filter((c) => c.uid !== me?.id && c.deviceCode));
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read your contacts.");
      setState("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 lg:px-5">
        <h1 className="text-lg font-semibold text-white">Chats</h1>
        <button
          onClick={load}
          disabled={state === "loading"}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-white/5 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", state === "loading" && "animate-spin")} />
        </button>
      </div>

      {state === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-gray-500">
          <Users className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Reading your contacts…</p>
        </div>
      )}

      {state === "error" && (
        <div className="mx-4 mt-4 flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={load}
            className="mt-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            Try again
          </button>
        </div>
      )}

      {state === "done" && contacts.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-gray-500">
          <UserPlus className="h-8 w-8" />
          <p className="text-sm">None of your contacts are on Hoox yet.</p>
          <p className="text-xs text-gray-600">
            Once a friend signs up with an email that's in your contacts, they'll show up here.
          </p>
        </div>
      )}

      {state === "done" && contacts.length > 0 && (
        <ul className="flex-1 overflow-y-auto px-2 pb-4 lg:px-3">
          {contacts.map((c) => {
            const active = derivedActive === c.deviceCode;
            return (
              <li key={c.uid}>
                <Link
                  to="/dm/$code"
                  params={{ code: c.deviceCode! }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    active ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                  )}
                >
                  <Avatar seed={c.avatarSeed} name={c.displayName} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-white">{c.displayName}</p>
                    <p className="truncate text-[13px] text-gray-500">
                      {c.deviceName && c.deviceName !== c.displayName ? c.deviceName : c.email}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
