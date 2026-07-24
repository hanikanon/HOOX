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
let lastDebugInfo = "";

/** Temporary diagnostic helper — lets the UI show exactly what happened
 * (or went wrong) the last time initOneSignal ran, since native plugin
 * failures on a real device are otherwise invisible with no way to check
 * logs remotely. Safe to keep around; just returns an empty string once
 * everything is confirmed working. */
export function getOneSignalDebugInfo(): string {
  return lastDebugInfo;
}

/** Boots the OneSignal SDK and registers this device under its own call
 * code (the same code shown on the Call screen), so other devices can push
 * a "you're being called" notification to it by that code — even while
 * this app is fully closed. Safe to call more than once; only does real
 * work the first time. No-ops outside a native app, since OneSignal's SDK
 * needs the real Android/iOS runtime, not a plain browser tab. */
export async function initOneSignal(): Promise<void> {
  if (initStarted) return;
  if (!Capacitor.isNativePlatform()) {
    lastDebugInfo = "Skipped: not running as a native app (plain browser tab).";
    return;
  }
  initStarted = true;
  try {
    lastDebugInfo = "Step 1: calling OneSignal.initialize()…";
    await OneSignal.initialize(ONESIGNAL_APP_ID);
    lastDebugInfo = "Step 2: calling OneSignal.Notifications.requestPermission()…";
    const accepted = await OneSignal.Notifications.requestPermission(true);
    lastDebugInfo = `Step 3: calling OneSignal.login() (permission accepted: ${accepted})…`;
    await OneSignal.login(getOrCreateDeviceCode());
    lastDebugInfo = `OK — logged in as ${getOrCreateDeviceCode()}, permission accepted: ${accepted}`;
    // If someone taps "Decline" on the call notification, remember that so
    // the app can auto-decline once it opens — there's no native code yet
    // to fully reject the call without ever opening the app.
    OneSignal.Notifications.addEventListener("click", (event) => {
      const actionId = event?.result?.actionId;
      if (actionId === "decline") {
        window.localStorage.setItem("hoox_pending_decline", "1");
      }
    });
  } catch (err) {
    // Push notifications are a nice-to-have on top of the app, not
    // something that should ever block someone from using the app itself
    // — but we keep the actual error around so it can be shown on screen
    // instead of vanishing silently.
    initStarted = false;
    lastDebugInfo = `FAILED at "${lastDebugInfo}" — ${err instanceof Error ? err.message : String(err)}`;
  }
}

let lastPushDebugInfo = "(no push attempted yet)";

/** Temporary diagnostic helper — shows exactly what happened the last time
 * this device tried to push a notification to someone (a call or a
 * message): whether the key was missing, what OneSignal's API actually
 * replied with, etc. A plain try/catch around fetch() only ever catches
 * network-level failures — an HTTP 400/401 response from OneSignal
 * resolves normally and was previously being silently treated as success. */
export function getLastPushDebugInfo(): string {
  return lastPushDebugInfo;
}

async function pushNotification(payload: Record<string, unknown>): Promise<void> {
  if (!ONESIGNAL_REST_API_KEY) {
    lastPushDebugInfo = "FAILED — no REST API key baked into this build (GitHub secret missing at build time).";
    window.alert(lastPushDebugInfo);
    return;
  }

  // The device is often mid-setup for the call's own network connection at
  // this exact moment, so a single fetch() can transiently fail ("Failed
  // to fetch") even though the network is fine a second later. Retry a
  // couple of times with a short delay before giving up.
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({ app_id: ONESIGNAL_APP_ID, target_channel: "push", ...payload }),
      });
      const bodyText = await res.text();
      lastPushDebugInfo = res.ok
        ? `OK (attempt ${attempt}) — HTTP ${res.status}: ${bodyText}`
        : `FAILED (attempt ${attempt}) — HTTP ${res.status}: ${bodyText}`;
      if (res.ok) {
        window.alert(lastPushDebugInfo);
        return;
      }
      // An HTTP error response (not a network failure) won't fix itself by
      // retrying — e.g. a bad key or malformed request stays bad.
      window.alert(lastPushDebugInfo);
      return;
    } catch (err) {
      lastPushDebugInfo = `FAILED (attempt ${attempt}/${maxAttempts}) — network error: ${err instanceof Error ? err.message : String(err)}`;
      if (attempt === maxAttempts) {
        window.alert(lastPushDebugInfo);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
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
    // Shows two tappable buttons directly on the Android notification —
    // both currently just open the app to the ringing screen (there's no
    // native code yet to answer/decline without opening it), but this
    // still gives a clear, familiar "this is a call" visual.
    buttons: [
      { id: "accept", text: kind === "video" ? "Answer video" : "Answer" },
      { id: "decline", text: "Decline" },
    ],
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
