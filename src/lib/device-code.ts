// One random, memorable-ish code per device, generated once and kept in
// localStorage — this is what gets shown to the person as "your call code".
// It intentionally has nothing to do with phone numbers, SIM cards, or any
// device identifier; it's just a random join code, the same idea as a Zoom
// meeting ID. It's also reused as this device's OneSignal external ID, so
// a call push notification can be targeted straight at the right device.
export function getOrCreateDeviceCode(): string {
  const KEY = "cryptvora_call_code";
  let code = window.localStorage.getItem(KEY);
  if (!code) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    window.localStorage.setItem(KEY, code);
  }
  return code;
}
