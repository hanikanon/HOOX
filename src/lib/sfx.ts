// Premium, subtle WebAudio SFX. Short, modern, satisfying — no assets, no network.
let ctx: AudioContext | null = null;
let enabled = true;
let master: GainNode | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
    } catch { return null; }
  }
  return ctx;
}

type Note = {
  f: number;                 // frequency Hz
  t?: number;                // start offset s
  d?: number;                // duration s
  type?: OscillatorType;
  g?: number;                // peak gain
  a?: number;                // attack s
  slide?: number;            // ramp to this Hz over d
};

function tone(notes: Note[]) {
  if (!enabled) return;
  const c = getCtx(); if (!c || !master) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const now = c.currentTime;

  // Soft "warmth" bus with lowpass for a premium feel.
  const bus = c.createGain(); bus.gain.value = 1;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000; lp.Q.value = 0.6;
  bus.connect(lp).connect(master);

  notes.forEach(({ f, t = 0, d = 0.12, type = "sine", g = 0.05, a = 0.006, slide }) => {
    const osc = c.createOscillator();
    const gn = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, now + t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + t + d);
    gn.gain.setValueAtTime(0.00001, now + t);
    gn.gain.exponentialRampToValueAtTime(g, now + t + a);
    gn.gain.exponentialRampToValueAtTime(0.00001, now + t + d);
    osc.connect(gn).connect(bus);
    osc.start(now + t);
    osc.stop(now + t + d + 0.03);
  });
}

// Tiny noise burst (used for taps / clicks)
function noise(d = 0.03, g = 0.02, hp = 2000) {
  if (!enabled) return;
  const c = getCtx(); if (!c || !master) return;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const src = c.createBufferSource(); src.buffer = buf;
  const filter = c.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = hp;
  const gn = c.createGain(); gn.gain.value = g;
  src.connect(filter).connect(gn).connect(master);
  src.start();
}

export const sfx = {
  setEnabled(v: boolean) { enabled = v; },
  // whoosh + soft chime
  send() {
    tone([
      { f: 720, d: 0.09, type: "sine", g: 0.05, slide: 1180 },
      { f: 1480, t: 0.06, d: 0.14, type: "triangle", g: 0.035 },
    ]);
  },
  // gentle two-note pluck
  receive() {
    tone([
      { f: 660, d: 0.14, type: "sine", g: 0.055 },
      { f: 990, t: 0.06, d: 0.18, type: "sine", g: 0.04 },
    ]);
  },
  delivered() { tone([{ f: 1320, d: 0.05, type: "sine", g: 0.028 }]); },
  read()      { tone([{ f: 1500, d: 0.05, g: 0.028 }, { f: 2000, t: 0.045, d: 0.06, g: 0.028 }]); },
  recordStart() {
    tone([{ f: 520, d: 0.12, type: "sine", g: 0.05, slide: 780 }]);
  },
  recordStop() {
    tone([{ f: 780, d: 0.12, type: "sine", g: 0.05, slide: 440 }]);
  },
  notify() {
    tone([
      { f: 880, d: 0.14, type: "triangle", g: 0.05 },
      { f: 1320, t: 0.08, d: 0.18, type: "triangle", g: 0.04 },
      { f: 1760, t: 0.14, d: 0.20, type: "sine", g: 0.03 },
    ]);
  },
  tap()   { noise(0.018, 0.012, 3500); tone([{ f: 1600, d: 0.025, type: "sine", g: 0.018 }]); },
  press() { tone([{ f: 420, d: 0.06, type: "sine", g: 0.03, slide: 260 }]); },
  cancel(){ tone([{ f: 320, d: 0.14, type: "sawtooth", g: 0.035, slide: 180 }]); },
};

export function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch { /* noop */ }
  }
}
