import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Firebase's client config is meant to be public — it's not a secret the
// way an API key with billing/send permissions is. Real protection comes
// from Firestore's security rules (see firestore.rules in the repo root),
// not from hiding these values.
const firebaseConfig = {
  apiKey: "AIzaSyDYU-jCYTVf67lDIp09LpSiOXPI5gaE5Q4",
  authDomain: "hoox-2b95d.firebaseapp.com",
  projectId: "hoox-2b95d",
  storageBucket: "hoox-2b95d.firebasestorage.app",
  messagingSenderId: "352430364246",
  appId: "1:352430364246:web:5955b145df332b58c14df7",
  measurementId: "G-67PJJNK3V3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);

let readyPromise: Promise<void> | null = null;

/** Firestore's security rules require a signed-in request (see
 * firestore.rules) — this is the minimum bar that stops random scripts on
 * the internet from reading/writing the database, even though this app
 * has no real account system yet. Anonymous auth gives each device a
 * stable identity behind the scenes without asking the person to sign
 * up for anything. Awaiting this once before the first read/write is
 * enough — later calls reuse the same session. */
export function ensureFirebaseReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsub();
            resolve();
          }
        },
        reject,
      );
      signInAnonymously(auth).catch(reject);
    });
  }
  return readyPromise;
}
