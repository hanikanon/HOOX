import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Check, X as XIcon, LogOut, Mail, Hash } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { getCurrentUser, getUserProfile, updateDisplayName, signOut, type HooxUser } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Hoox" },
      { name: "description", content: "Your Hoox profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<HooxUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const user = await getCurrentUser();
    if (user) {
      const p = await getUserProfile(user.id);
      setProfile(p);
      setNameInput(p?.displayName ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveName = async () => {
    if (!profile || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateDisplayName(profile.uid, nameInput);
      setProfile({ ...profile, displayName: nameInput.trim() });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-24 text-sm text-muted-foreground">
        Couldn't load your profile.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-10 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <Avatar seed={profile.avatarSeed} name={profile.displayName} size={96} />

        <div className="mt-4 w-full max-w-xs">
          {editing ? (
            <div className="flex flex-col items-center gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xl font-semibold text-white focus:border-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setNameInput(profile.displayName);
                    setError(null);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
                >
                  <XIcon className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group flex items-center justify-center gap-2 text-2xl font-semibold text-white"
            >
              {profile.displayName}
              <Pencil className="h-4 w-4 text-gray-500 group-hover:text-white" />
            </button>
          )}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          This is the name people see when they search for you or find you as a contact.
        </p>
      </div>

      <div className="mt-8 space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <Mail className="h-4 w-4 shrink-0 text-gray-500" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Email</p>
            <p className="truncate text-[15px] text-white">{profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-white/5 px-4 py-3">
          <Hash className="h-4 w-4 shrink-0 text-gray-500" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Your call/chat code</p>
            <p className="truncate text-[15px] text-white">{profile.deviceCode ?? "—"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
