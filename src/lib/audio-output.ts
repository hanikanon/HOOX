/** Picks a `setSinkId`-compatible device id for the requested output.
 * Support for this varies a lot across Android WebView versions — some
 * simply don't expose a "speaker" vs "earpiece" audiooutput device at all,
 * in which case this returns null and the caller should treat the toggle
 * as best-effort (the UI still reflects the person's choice even if the
 * OS doesn't expose a way to act on it here). */
export async function pickAudioOutputSinkId(wantSpeaker: boolean): Promise<string | null> {
  if (!navigator.mediaDevices?.enumerateDevices) return null;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputs = devices.filter((d) => d.kind === "audiooutput");
    if (!outputs.length) return null;
    const speaker = outputs.find((d) => /speaker/i.test(d.label));
    const earpiece = outputs.find((d) => /earpiece|receiver/i.test(d.label));
    if (wantSpeaker) return speaker?.deviceId ?? null;
    return earpiece?.deviceId ?? "default";
  } catch {
    return null;
  }
}

type SinkableMediaElement = HTMLMediaElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

export async function applySinkId(el: HTMLMediaElement | null, sinkId: string | null): Promise<void> {
  if (!el || sinkId === null) return;
  const sinkable = el as SinkableMediaElement;
  if (typeof sinkable.setSinkId !== "function") return;
  try {
    await sinkable.setSinkId(sinkId);
  } catch {
    // Not supported/allowed in this WebView — the mute/camera/end buttons
    // still work regardless, this one control is just best-effort.
  }
}
