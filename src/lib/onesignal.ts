import { Capacitor } from "@capacitor/core";
import OneSignal from "@onesignal/capacitor-plugin";
import { getOrCreateDeviceCode } from "@/lib/device-code";

// These identify *this app's* OneSignal project. Shipping the App ID in the
// bundle is normal and expected — every push SDK does this.
const ONESIGNAL_APP_ID = "33aa8a5b-1731-4623-8a77-8ad91836f221";
// This lets any device send a push straight through OneSignal with no
// backend server of ours in between — convenient, but it does mean anyone
// who extracts this from the built APK could send arbitrary notifications
// through this app's OneSignal project. Fine for a small personal app
// between people who trust each other; would need to move behind a real
// server before this app has many strangers using it.
//
// The value itself is NOT written here on purpose — GitHub blocks pushes
// that contain a recognizable secret like this one (that's what happened).
// It's read from an environment variable set at build time instead (see
// .github/workflows/build-android.yml, which pulls it from a GitHub
// Actions secret you set once in the repo's Settings → Secrets). It still
// ends up inside the built app the same as before — see the risk note
// above — it just never gets committed to git history.
const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY as string | undefined;

let initStarted = false;

/** Boots the OneSignal SDK and registers this device under its own call
 * code (the same code shown on the Call screen), so other devices can push
 * a "you're being called" notification to it by that code — even while
 * this app is fully closed. Safe to call more than once; only does real
 * work the first time. No-ops outside a native app, since OneSignal's SDK
 * needs the real Android/iOS runtime, not a plain browser tab. */
export async function initOneSignal(): Promise<void> {
  if (initStarted || !Capacitor.isNativePlatform()) return;
  initStarted = true;
  try {
    await OneSignal.initialize({ appId: ONESIGNAL_APP_ID });
    await OneSignal.Notifications.requestPermission(true);
    await OneSignal.login(getOrCreateDeviceCode());
  } catch {
    // Push notifications are a nice-to-have on top of the app, not
    // something that should ever block someone from using the app itself.
    initStarted = false;
  }
}

async function pushNotification(payload: Record<string, unknown>): Promise<void> {
  if (!ONESIGNAL_REST_API_KEY) return; // build didn't have the secret set — see note above
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({ app_id: ONESIGNAL_APP_ID, target_channel: "push", ...payload }),
    });
  } catch {
    // Best effort only — see the doc comments on the exported functions.
  }
}

/** Best-effort — asks OneSignal to push a "you're being called" notification
 * straight to the other device registered under `toCode`. This is purely
 * additive: the in-call ringing UI already works whenever both apps happen
 * to be open; this is what makes it also reach someone whose app is
 * closed. Any failure (offline, OneSignal down, the person never finished
 * onboarding notifications, etc.) is swallowed on purpose. */
export function sendCallPushNotification(toCode: string, fromCode: string, kind: "audio" | "video"): Promise<void> {
  return pushNotification({
    include_aliases: { external_id: [toCode] },
    headings: { en: kind === "video" ? "Incoming video call" : "Incoming call" },
    contents: { en: `${fromCode} is calling you on Hoox` },
    data: { type: "incoming_call", from: fromCode, kind },
    priority: 10,
    ttl: 45,
  });
}

/** Best-effort — pushes a normal "new message" notification to the other
 * device. Same idea as sendCallPushNotification, just a lighter-weight
 * notification (no special ringing/urgency needed for a text message). */
export function sendMessagePushNotification(toCode: string, fromCode: string, preview: string): Promise<void> {
  return pushNotification({
    include_aliases: { external_id: [toCode] },
    headings: { en: fromCode },
    contents: { en: preview.slice(0, 120) },
    data: { type: "message", from: fromCode },
  });
}
