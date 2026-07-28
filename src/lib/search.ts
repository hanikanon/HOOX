import { supabase } from "./supabase";
import type { HooxUser } from "./auth";

function rowToUser(row: Record<string, unknown>): HooxUser {
  return {
    uid: row.uid as string,
    email: row.email as string,
    displayName: row.display_name as string,
    photoURL: (row.photo_url as string) ?? "",
    avatarSeed: row.avatar_seed as string,
    deviceCode: (row.device_code as string) ?? null,
    createdAt: (row.created_at as string) ?? null,
  };
}

/** Finds real Hoox accounts by name — this is how you reach a friend who
 * isn't already saved in your phone's contacts (the automatic matching in
 * lib/contacts.ts only covers people who are). Requires at least 2
 * characters; returns up to 20 matches, most-recently-joined first. */
export async function searchUsers(query: string, excludeUid?: string): Promise<HooxUser[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  let request = supabase
    .from("profiles")
    .select("*")
    .or(`display_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (excludeUid) {
    request = request.neq("uid", excludeUid);
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []).map(rowToUser);
}
