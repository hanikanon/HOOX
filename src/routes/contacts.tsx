import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, RefreshCw, ShieldAlert, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { getMatchedContacts, type MatchedContact } from "@/lib/contacts";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Hoox" }] }),
  component: ContactsPage,
});

type LoadState = "idle" | "loading" | "error" | "done";

function ContactsPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<MatchedContact[]>([]);

  const load = async () => {
    setState("loading");
    setError(null);
    try {
      const me = await getCurrentUser();
      const matched = await getMatchedContacts();
      setContacts(matched.filter((c) => c.uid !== me?.id));
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
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Contacts on Hoox</h1>
        <button
          onClick={load}
          disabled={state === "loading"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-white/5 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${state === "loading" ? "animate-spin" : ""}`} />
        </button>
      </header>

      {state === "loading" && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
          <Users className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Reading your contacts…</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
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
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
          <Users className="h-8 w-8" />
          <p className="text-sm">None of your contacts are on Hoox yet.</p>
        </div>
      )}

      {state === "done" && contacts.length > 0 && (
        <ul className="space-y-1">
          {contacts.map((c) => {
            const row = (
              <>
                <Avatar seed={c.avatarSeed} name={c.displayName} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-white">{c.displayName}</p>
                  <p className="truncate text-[13px] text-gray-500">
                    {c.deviceName && c.deviceName !== c.displayName
                      ? `${c.deviceName} · ${c.email}`
                      : c.email}
                  </p>
                </div>
                {c.deviceCode && <MessageCircle className="h-5 w-5 shrink-0 text-primary" />}
              </>
            );
            // Contacts who signed up before device_code existed on their
            // profile (or who haven't opened the app since) won't have one
            // yet — show them, but there's nothing to link to until they do.
            return c.deviceCode ? (
              <Link
                key={c.uid}
                to="/dm/$code"
                params={{ code: c.deviceCode }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5"
              >
                {row}
              </Link>
            ) : (
              <div key={c.uid} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 opacity-60">
                {row}
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
}
