import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export interface HooxUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  avatarSeed: string;
  createdAt: Timestamp | null;
}

/** Opens the native Google account picker. Uses
 * @capacitor-firebase/authentication, which signs the person into both the
 * native Google SDK *and* this app's Firebase JS SDK session (`auth` from
 * lib/firebase.ts) in one call — no manual token exchange needed. Throws if
 * the person cancels the picker or it otherwise fails; surface
 * `error.message`. */
export async function signInWithGoogle(): Promise<void> {
  const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
  const result = await FirebaseAuthentication.signInWithGoogle();
  if (!result.user) {
    throw new Error("Google sign-in didn't complete — try again.");
  }
}

/** Creates the person's `users/{uid}` profile document the first time they
 * sign in, or just returns it if it already exists. This is the doc other
 * people's devices look up (by email) to find them as a contact. */
export async function ensureUserProfile(user: User): Promise<HooxUser> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as HooxUser;
  }

  const email = (user.email ?? "").toLowerCase();
  const profile = {
    uid: user.uid,
    email,
    displayName: user.displayName ?? email.split("@")[0] ?? "Hoox user",
    photoURL: user.photoURL ?? "",
    avatarSeed: user.uid.slice(0, 12),
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { ...profile, createdAt: null };
}

export async function getUserProfile(uid: string): Promise<HooxUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as HooxUser) : null;
}

/** Fires on every Firebase auth-state change — this is what __root.tsx
 * uses to move between the sign-in screen and the app the moment
 * signInWithGoogle() finishes (no separate "done" callback needed). */
export function watchAuthState(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function signOut(): Promise<void> {
  try {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut();
  } catch {
    // Web preview / native sign-out unavailable — still sign the Firebase
    // JS session out below.
  }
  await firebaseSignOut(auth);
}
