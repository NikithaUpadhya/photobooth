import { useEffect, useRef, useState } from "react";
import { composeStrip, type StripOptions } from "@/lib/compose-strip";

type Result = { url: string; blob: Blob; photos: string[] };

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
        setResult({ url, blob, photos }); // remember which photos this strip was built from
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

  // Only return a strip if it was built from *these* photos
  return enabled && result?.photos === photos ? result : null;
}