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
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const cancelled = useRef(false);

  /** One countdown → capture → flash. Returns false if cancelled or capture failed. */
  const shootOnce = useCallback(
    async (onPhoto: (photo: string) => void) => {
      setPhase("countdown");
      for (let n = COUNT_FROM; n > 0; n--) {
        setCount(n);
        await sleep(TICK_MS);
        if (cancelled.current) return false;
      }

      const photo = capture();
      if (!photo) return false;

      onPhoto(photo); // same tick as setPhase → one render, one flash
      setPhase("flash");

      await sleep(AFTER_SHOT_MS);
      return !cancelled.current;
    },
    [capture],
  );

  /** Full session: 4 shots in a row */
  const start = useCallback(async () => {
    cancelled.current = false;
    setRetakeIndex(null);
    setPhotos([]);

    for (let shot = 0; shot < SHOTS; shot++) {
      const ok = await shootOnce((photo) => setPhotos((prev) => [...prev, photo]));
      if (!ok) {
        if (!cancelled.current) setPhase("idle"); // capture failed
        return;
      }
    }
    setPhase("done");
  }, [shootOnce]);

  /** Redo one shot, keep the others */
  const retake = useCallback(
    async (index: number) => {
      cancelled.current = false;
      setRetakeIndex(index);

      await shootOnce((photo) =>
        setPhotos((prev) => prev.map((p, i) => (i === index ? photo : p))),
      );
      if (cancelled.current) return;

      setRetakeIndex(null);
      setPhase("done"); // even if capture failed, the old photo is still there
    },
    [shootOnce],
  );

  const reset = useCallback(() => {
    cancelled.current = true;
    setPhotos([]);
    setRetakeIndex(null);
    setPhase("idle");
  }, []);

  useEffect(() => () => { cancelled.current = true; }, []);

  return {
    phase,
    count,
    photos,
    retakeIndex,
    shotIndex: photos.length,
    isRunning: phase === "countdown" || phase === "flash",
    start,
    retake,
    reset,
  };
}