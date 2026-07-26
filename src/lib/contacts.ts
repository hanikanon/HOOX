import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "./firebase";
import type { HooxUser } from "./auth";

export interface MatchedContact extends HooxUser {
  /** The name saved for this person in the device's own address book, if
   * different from their Hoox display name — shown as a secondary line so
   * "who is this" is never ambiguous. */
  deviceName?: string;
}

/** Firestore's `in` operator caps out at 30 values per query — chunk the
 * email list and issue one query per chunk. */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Requests the device's contacts permission (if not already granted),
 * reads the address book, and returns whichever of those email addresses
 * belong to a real registered Hoox user (matched on the Google account
 * email, since sign-in is Google-only — see lib/auth.ts). Safe to call
 * repeatedly — it always re-reads live data rather than caching, since
 * who's on Hoox changes as more people sign up. */
export async function getMatchedContacts(): Promise<MatchedContact[]> {
  const { Contacts } = await import("@capacitor-community/contacts");

  const permission = await Contacts.requestPermissions();
  if (permission.contacts !== "granted") {
    throw new Error("Contacts permission was denied.");
  }

  const { contacts } = await Contacts.getContacts({
    projection: { name: true, emails: true },
  });

  const deviceNameByEmail = new Map<string, string>();
  for (const c of contacts) {
    const displayName = c.name?.display ?? "";
    for (const e of c.emails ?? []) {
      const normalized = (e.address ?? "").trim().toLowerCase();
      if (normalized && !deviceNameByEmail.has(normalized)) {
        deviceNameByEmail.set(normalized, displayName);
      }
    }
  }

  const emails = [...deviceNameByEmail.keys()];
  if (emails.length === 0) return [];

  // Single-field `in` queries need no composite index in Firestore.
  const matches: MatchedContact[] = [];
  const usersRef = collection(db, "users");
  for (const batch of chunk(emails, 30)) {
    const snap = await getDocs(query(usersRef, where("email", "in", batch)));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as HooxUser;
      matches.push({
        ...data,
        deviceName: deviceNameByEmail.get(data.email),
      });
    });
  }

  return matches;
}

// For callers that already know a set of uids (e.g. an existing chat's
// member list) and want to fetch those profiles directly instead of
// matching by email.
export async function getUsersByIds(uids: string[]): Promise<HooxUser[]> {
  if (uids.length === 0) return [];
  const usersRef = collection(db, "users");
  const results: HooxUser[] = [];
  for (const batch of chunk(uids, 30)) {
    const snap = await getDocs(query(usersRef, where(documentId(), "in", batch)));
    snap.forEach((docSnap) => results.push(docSnap.data() as HooxUser));
  }
  return results;
}
