import { useCallback, useEffect, useRef, useState } from "react";

export const SHOTS = 4;
const COUNT_FROM = 3;
const TICK_MS = 1000;
const AFTER_SHOT_MS = 900;

export type SessionPhase = "idle" | "countdown" | "flash" | "done";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function usePhotoSession(capture: () => string | null) {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [count, setCount] = useState(COUNT_FROM);
  const [photos, setPhotos] = useState<string[]>([]);
  const cancelled = useRef(false);

  const start = useCallback(async () => {
    cancelled.current = false;
    setPhotos([]);

    for (let shot = 0; shot < SHOTS; shot++) {
      // 3 … 2 … 1
      setPhase("countdown");
      for (let n = COUNT_FROM; n > 0; n--) {
        setCount(n);
        await sleep(TICK_MS);
        if (cancelled.current) return;
      }

      // snap!
      const photo = capture();
      if (!photo) {
        setPhase("idle");
        return;
      }
      setPhotos((prev) => [...prev, photo]);
      setPhase("flash");

      await sleep(AFTER_SHOT_MS);
      if (cancelled.current) return;
    }

    setPhase("done");
  }, [capture]);

  const reset = useCallback(() => {
    cancelled.current = true;
    setPhotos([]);
    setPhase("idle");
  }, []);

  // stop the loop if the component unmounts mid-session
  useEffect(() => () => { cancelled.current = true; }, []);

  return {
    phase,
    count,
    photos,
    shotIndex: photos.length,
    isRunning: phase === "countdown" || phase === "flash",
    start,
    reset,
  };
}