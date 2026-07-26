import { registerPlugin } from "@capacitor/core";

/**
 * Bridges the native full-screen incoming-call UI (see android/) back to the
 * JS call logic in src/hooks/use-call.tsx.
 *
 * - `addListener("callAction", cb)` fires the moment the person taps
 *   Answer/Decline on the native call screen or notification, *if* the
 *   webview is already alive to hear it.
 * - `checkPendingAction()` covers the case where the action happened before
 *   the webview finished booting (app was fully closed) — call this once on
 *   startup and again on every resume; it returns the pending action once
 *   and clears it.
 */
const IncomingCall = registerPlugin("IncomingCall", {});

export default IncomingCall;
