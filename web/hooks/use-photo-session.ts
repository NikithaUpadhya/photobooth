import { useCallback, useEffect, useRef, useState } from "react";

const COUNT_FROM = 3;
const TICK_MS = 1000;
const AFTER_SHOT_MS = 900;
export const BURST_FRAMES = 8;
const BURST_MS = 100;

export type SessionPhase = "idle" | "countdown" | "flash" | "done";
export type BurstFrame = HTMLCanvasElement;

type Callbacks = {
  onTick?: (n: number) => void;
  onShutter?: () => void;
  sampleBurst?: () => BurstFrame | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function usePhotoSession(
  capture: () => string | null,
  shots: number,
  callbacks: Callbacks = {},
) {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [count, setCount] = useState(COUNT_FROM);
  const [photos, setPhotos] = useState<string[]>([]);
  const [bursts, setBursts] = useState<BurstFrame[][]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Each run gets an ID. Bumping runId makes every older loop "stale".
  const runId = useRef(0);

  // "Latest ref": always call the newest callbacks without re-creating start/retake
  const cb = useRef(callbacks);
  useEffect(() => {
    cb.current = callbacks;
  });

  // Last second of the countdown: grab frames leading right up to the shutter
  const recordBurst = useCallback(async () => {
    const frames: BurstFrame[] = [];
    await sleep(TICK_MS - BURST_FRAMES * BURST_MS);
    for (let i = 0; i < BURST_FRAMES; i++) {
      await sleep(BURST_MS);
      const frame = cb.current.sampleBurst?.();
      if (frame) frames.push(frame);
    }
    return frames;
  }, []);

  const shootOnce = useCallback(
    async (id: number, onPhoto: (photo: string, burst: BurstFrame[]) => void) => {
      setPhase("countdown");
      let burst: BurstFrame[] = [];
      for (let n = COUNT_FROM; n > 0; n--) {
        setCount(n);
        cb.current.onTick?.(n);
        if (n === 1) burst = await recordBurst();
        else await sleep(TICK_MS);
        if (runId.current !== id) return false;
      }

      const photo = capture();
      if (!photo) return false;

      cb.current.onShutter?.();
      onPhoto(photo, burst);
      setPhase("flash");

      await sleep(AFTER_SHOT_MS);
      return runId.current === id;
    },
    [capture, recordBurst],
  );

  const start = useCallback(async () => {
    const id = ++runId.current;
    setRetakeIndex(null);
    setPhotos([]);
    setBursts([]);

    for (let shot = 0; shot < shots; shot++) {
      const ok = await shootOnce(id, (photo, burst) => {
        setPhotos((prev) => [...prev, photo]);
        setBursts((prev) => [...prev, burst]);
      });
      if (!ok) {
        if (runId.current === id) setPhase("idle"); // capture failed (not cancelled)
        return;
      }
    }
    setPhase("done");
  }, [shootOnce, shots]);

  const retake = useCallback(
    async (index: number) => {
      const id = ++runId.current;
      setRetakeIndex(index);

      await shootOnce(id, (photo, burst) => {
        setPhotos((prev) => prev.map((p, i) => (i === index ? photo : p)));
        setBursts((prev) => prev.map((b, i) => (i === index ? burst : b)));
      });
      if (runId.current !== id) return;

      setRetakeIndex(null);
      setPhase("done");
    },
    [shootOnce],
  );

  /** Esc: stop whatever is running */
  const cancel = useCallback(() => {
    runId.current++;
    if (retakeIndex !== null) {
      setRetakeIndex(null);
      setPhase("done"); 
    } else {
      setPhotos([]);
      setBursts([]);
      setPhase("idle");
    }
  }, [retakeIndex]);

  const reset = useCallback(() => {
    runId.current++;
    setRetakeIndex(null);
    setPhotos([]);
    setBursts([]);
    setPhase("idle");
  }, []);

  useEffect(() => {
    const ref = runId;
    return () => {
      ref.current++; // unmount → stop any running loop
    };
  }, []);

  return {
    phase,
    count,
    photos,
    bursts,
    retakeIndex,
    shotIndex: photos.length,
    isRunning: phase === "countdown" || phase === "flash",
    start,
    retake,
    cancel,
    reset,
  };
}
