import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface HooxUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  avatarSeed: string;
  /** The same code lib/device-code.ts generates for this device — this is
   * what actually makes a matched contact reachable for a real chat/call
   * (see lib/messaging.ts, routes/dm.$code.tsx) instead of just being a
   * name in a list. */
  deviceCode: string | null;
  createdAt: string | null;
}

const REDIRECT_URL = "hoox://login-callback";

/** Opens the system browser to Google's consent screen (via Supabase Auth's
 * OAuth flow) and waits for the "hoox://login-callback" redirect to come
 * back — wired up once in __root.tsx via @capacitor/app's `appUrlOpen`
 * listener, which calls `completeSignIn()` below with the redirect URL.
 * This resolves once that round trip finishes; throws if the person
 * cancels or the exchange fails. */
export function signInWithGoogle(): Promise<Session> {
  return new Promise((resolve, reject) => {
    let settled = false;

    pendingSignIn = { resolve: (s) => { settled = true; resolve(s); }, reject: (e) => { settled = true; reject(e); } };

    (async () => {
      try {
        const { Browser } = await import("@capacitor/browser");
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: REDIRECT_URL, skipBrowserRedirect: true },
        });
        if (error || !data?.url) throw error ?? new Error("Couldn't start Google sign-in.");
        await Browser.open({ url: data.url, presentationStyle: "popover" });
      } catch (err) {
        if (!settled) pendingSignIn?.reject(err instanceof Error ? err : new Error(String(err)));
      }
    })();

    // Safety net: if the person closes the browser without finishing (or
    // the redirect never arrives), don't leave the caller hanging forever.
    setTimeout(() => {
      if (!settled) pendingSignIn?.reject(new Error("Sign-in timed out — try again."));
    }, 120_000);
  });
}

let pendingSignIn: { resolve: (s: Session) => void; reject: (e: Error) => void } | null = null;

/** Called from __root.tsx's `appUrlOpen` listener with the full redirect
 * URL the moment the "hoox://login-callback" deep link fires. Exchanges
 * the auth code in that URL for a real Supabase session. */
export async function completeSignIn(url: string): Promise<void> {
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.close().catch(() => {});

    // Implicit flow puts the session directly in the URL's fragment:
    // hoox://login-callback#access_token=...&refresh_token=...
    const hashIndex = url.indexOf("#");
    const params = new URLSearchParams(hashIndex >= 0 ? url.slice(hashIndex + 1) : "");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const errorDescription = params.get("error_description");
    if (errorDescription) throw new Error(errorDescription);
    if (!access_token || !refresh_token) {
      throw new Error("Sign-in didn't return a valid session — try again.");
    }

    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error || !data.session) throw error ?? new Error("Sign-in didn't complete.");
    pendingSignIn?.resolve(data.session);
  } catch (err) {
    pendingSignIn?.reject(err instanceof Error ? err : new Error(String(err)));
  } finally {
    pendingSignIn = null;
  }
}

/** Creates the person's `profiles` row the first time they sign in, or
 * just returns it if it already exists. This is the row other people's
 * devices look up (by email) to find them as a contact. */
export async function ensureUserProfile(user: User): Promise<HooxUser> {
  const existing = await getUserProfile(user.id);
  if (existing) return existing;

  const { getOrCreateDeviceCode } = await import("./device-code");
  const email = (user.email ?? "").toLowerCase();
  const meta = user.user_metadata ?? {};
  const profile = {
    uid: user.id,
    email,
    display_name: (meta.full_name as string) || (meta.name as string) || email.split("@")[0] || "Hoox user",
    photo_url: (meta.avatar_url as string) || (meta.picture as string) || "",
    avatar_seed: user.id.slice(0, 12),
    device_code: getOrCreateDeviceCode(),
  };
  const { error } = await supabase.from("profiles").insert(profile);
  if (error) throw error;

  const saved = await getUserProfile(user.id);
  if (!saved) throw new Error("Profile was saved but couldn't be re-read.");
  return saved;
}

export async function getUserProfile(uid: string): Promise<HooxUser | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("uid", uid).maybeSingle();
  if (error || !data) return null;
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.display_name,
    photoURL: data.photo_url ?? "",
    avatarSeed: data.avatar_seed,
    deviceCode: data.device_code ?? null,
    createdAt: data.created_at ?? null,
  };
}

/** Fills in a missing call/chat code on an existing profile — needed for
 * accounts created before this field existed on the profiles table (they
 * signed up, got a row, but device_code was never set). Without this,
 * those people show up in search/contacts but aren't reachable at all
 * (no code to open a chat/call with). Safe and cheap to call on every
 * app launch: a no-op once the code is already there. */
export async function ensureDeviceCode(profile: HooxUser): Promise<HooxUser> {
  if (profile.deviceCode) return profile;

  const { getOrCreateDeviceCode } = await import("./device-code");
  const deviceCode = getOrCreateDeviceCode();
  const { error } = await supabase
    .from("profiles")
    .update({ device_code: deviceCode })
    .eq("uid", profile.uid);
  if (error) throw error;

  return { ...profile, deviceCode };
}

/** Lets the signed-in person change the name their contacts and search
 * results show for them (see lib/search.ts, hooks/use-matched-contacts.ts)
 * — this is what they land on Search with by default from their Google
 * account, but it's editable rather than fixed. */
export async function updateDisplayName(uid: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name can't be empty.");
  const { error } = await supabase.from("profiles").update({ display_name: trimmed }).eq("uid", uid);
  if (error) throw error;
}

/** Fires on every Supabase auth-state change — this is what __root.tsx
 * uses to move between the sign-in screen and the app. */
export function watchAuthState(cb: (user: User | null) => void): () => void {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  return () => sub.subscription.unsubscribe();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
