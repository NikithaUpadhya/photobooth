import { useEffect, useRef, useState } from "react";
import { composeStrip, type StripOptions } from "@/lib/compose-strip";

type Result = { url: string; blob: Blob };

export function useComposedStrip(photos: string[], options: StripOptions, enabled: boolean) {
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    composeStrip(photos, options)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current); 
        urlRef.current = url;
        setResult({ url, blob });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [photos, options, enabled]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return enabled ? result : null;
}