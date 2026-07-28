import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, UserPlus, ShieldAlert, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { searchUsers } from "@/lib/search";
import { getCurrentUser } from "@/lib/auth";
import type { HooxUser } from "@/lib/auth";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [{ title: "Search — Hoox" }],
  }),
  component: SearchPage,
});

/** Finds real people on Hoox by name — the way to reach a friend who isn't
 * already in your phone's contacts (the Chats/Contacts screens only show
 * people matched automatically from your address book). */
function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HooxUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const me = await getCurrentUser();
        const found = await searchUsers(trimmed, me?.id);
        if (!cancelled) setResults(found);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Search failed — try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 lg:px-8 lg:pt-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight lg:text-3xl">Search</h1>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3 focus-within:ring-1 focus-within:ring-primary/40">
        <SearchIcon className="size-[18px] text-muted-foreground" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people on Hoox by name…"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      {loading && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Searching…</p>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
          <ShieldAlert className="h-6 w-6 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No one on Hoox matches "{query.trim()}".
        </p>
      )}

      {!loading && query.trim().length < 2 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <UserPlus className="h-8 w-8" />
          <p className="text-sm">Type at least 2 letters of a name to find someone on Hoox.</p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-6 space-y-1">
          {results.map((u) => {
            const row = (
              <>
                <Avatar seed={u.avatarSeed} name={u.displayName} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{u.displayName}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{u.email}</p>
                </div>
                {u.deviceCode && <MessageCircle className="h-5 w-5 shrink-0 text-primary" />}
              </>
            );
            return u.deviceCode ? (
              <Link
                key={u.uid}
                to="/dm/$code"
                params={{ code: u.deviceCode }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5"
              >
                {row}
              </Link>
            ) : (
              <div key={u.uid} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 opacity-60">
                {row}
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
}
