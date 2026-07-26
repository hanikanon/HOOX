import type { PluginListenerHandle } from "@capacitor/core";

export interface CallActionPayload {
  action?: "answer" | "decline" | "wake";
  callId?: string;
  from?: string;
  kind?: "audio" | "video";
}

export interface IncomingCallPlugin {
  addListener(
    eventName: "callAction",
    listenerFunc: (payload: CallActionPayload) => void,
  ): Promise<PluginListenerHandle>;
  checkPendingAction(): Promise<CallActionPayload>;
}

declare const IncomingCall: IncomingCallPlugin;
export default IncomingCall;
