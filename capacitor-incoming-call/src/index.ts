import { registerPlugin } from "@capacitor/core";
import type { IncomingCallPlugin } from "../dist/index";

const IncomingCall = registerPlugin<IncomingCallPlugin>("IncomingCall", {});

export default IncomingCall;
export type { IncomingCallPlugin, CallActionPayload } from "../dist/index";
