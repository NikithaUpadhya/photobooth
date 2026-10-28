let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playTick(final = false) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.value = final ? 1320 : 880;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01); 
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); 

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.13);
}

export function playShutter() {
  const ac = audio();
  if (!ac) return;

  const length = Math.floor(ac.sampleRate * 0.15); // 150 ms
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }

  const noise = ac.createBufferSource();
  noise.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2500;
  filter.Q.value = 0.8;

  const gain = ac.createGain();
  gain.gain.value = 0.5;

  noise.connect(filter).connect(gain).connect(ac.destination);
  noise.start();
}