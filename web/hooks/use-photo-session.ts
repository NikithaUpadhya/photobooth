import { useCallback, useEffect, useRef, useState } from "react";

const COUNT_FROM = 3;
const TICK_MS = 1000;
const AFTER_SHOT_MS = 900;

export type SessionPhase = "idle" | "countdown" | "flash" | "done";

type Callbacks = {
  onTick?: (n: number) => void;
  onShutter?: () => void;
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
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Each run gets an ID. Bumping runId makes every older loop "stale".
  const runId = useRef(0);

  // "Latest ref": always call the newest callbacks without re-creating start/retake
  const cb = useRef(callbacks);
  useEffect(() => {
    cb.current = callbacks;
  });

  const shootOnce = useCallback(
    async (id: number, onPhoto: (photo: string) => void) => {
      setPhase("countdown");
      for (let n = COUNT_FROM; n > 0; n--) {
        setCount(n);
        cb.current.onTick?.(n);
        await sleep(TICK_MS);
        if (runId.current !== id) return false;
      }

      const photo = capture();
      if (!photo) return false;

      cb.current.onShutter?.();
      onPhoto(photo);
      setPhase("flash");

      await sleep(AFTER_SHOT_MS);
      return runId.current === id;
    },
    [capture],
  );

  const start = useCallback(async () => {
    const id = ++runId.current;
    setRetakeIndex(null);
    setPhotos([]);

    for (let shot = 0; shot < shots; shot++) {
      const ok = await shootOnce(id, (photo) => setPhotos((prev) => [...prev, photo]));
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

      await shootOnce(id, (photo) =>
        setPhotos((prev) => prev.map((p, i) => (i === index ? photo : p))),
      );
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
      setPhase("idle");
    }
  }, [retakeIndex]);

  const reset = useCallback(() => {
    runId.current++;
    setRetakeIndex(null);
    setPhotos([]);
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
    retakeIndex,
    shotIndex: photos.length,
    isRunning: phase === "countdown" || phase === "flash",
    start,
    retake,
    cancel,
    reset,
  };
}