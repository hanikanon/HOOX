import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db, ensureFirebaseReady } from "@/lib/firebase";
import { getOrCreateDeviceCode } from "@/lib/device-code";
import { sendMessagePushNotification } from "@/lib/onesignal";

export interface DirectMessage {
  id: string;
  text: string;
  senderCode: string;
  /** null for the brief moment between sending and the server assigning a
   * real timestamp — treat as "just now" in the UI. */
  createdAt: Date | null;
}

/** Two devices always agree on the same conversation id without needing to
 * ask a server first — it's just their two call codes, sorted so it comes
 * out the same regardless of who's "me" and who's "them". */
function getConversationId(codeA: string, codeB: string): string {
  return [codeA, codeB].sort().join("_");
}

function messagesCollection(withCode: string) {
  const myCode = getOrCreateDeviceCode();
  const conversationId = getConversationId(myCode, withCode.toUpperCase());
  return collection(db, "conversations", conversationId, "messages");
}

/** Sends a text message to the device registered under `toCode`. Resolves
 * once Firestore has durably stored it — from that point on, the other
 * person will see it whenever they next open the app (or immediately, if
 * they already have this conversation open). */
export async function sendDirectMessage(toCode: string, text: string): Promise<void> {
  await ensureFirebaseReady();
  await addDoc(messagesCollection(toCode), {
    text,
    senderCode: getOrCreateDeviceCode(),
    createdAt: serverTimestamp(),
  });
  // Best-effort — reaches the other device even if their app is closed.
  void sendMessagePushNotification(toCode.toUpperCase(), getOrCreateDeviceCode(), text);
}

/** Live-subscribes to the full message history with `withCode`, most
 * recent last. Fires immediately with whatever's already stored, then
 * again every time a new message arrives — from either side, while the
 * screen is open. Call the returned function to stop listening (e.g. when
 * leaving the chat screen). */
export function subscribeToDirectMessages(
  withCode: string,
  onMessages: (messages: DirectMessage[]) => void,
): () => void {
  let unsubscribe = () => {};
  let cancelled = false;

  ensureFirebaseReady().then(() => {
    if (cancelled) return;
    const q = query(messagesCollection(withCode), orderBy("createdAt", "asc"), limit(500));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: DirectMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
        return {
          id: doc.id,
          text: data.text as string,
          senderCode: data.senderCode as string,
          createdAt,
        };
      });
      onMessages(messages);
    });
  });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
