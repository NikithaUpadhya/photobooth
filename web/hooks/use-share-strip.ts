import { useCallback, useRef, useState } from "react";
import { uploadStrip, type SharedStrip } from "@/lib/api";
import type { StripOptions } from "@/lib/compose-strip";

export type ShareState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "shared"; strip: SharedStrip; pageUrl: string }
  | { status: "error"; message: string };

type Shared = Extract<ShareState, { status: "shared" }>;

export function useShareStrip() {
  const [state, setState] = useState<ShareState>({ status: "idle" });
  const cache = useRef<{ blob: Blob; result: Shared } | null>(null);

  const share = useCallback(async (blob: Blob, options: StripOptions) => {
    if (cache.current?.blob === blob) {
      setState(cache.current.result);
      return;
    }

    setState({ status: "uploading" });
    try {
      const strip = await uploadStrip(blob, options);
      const result: Shared = {
        status: "shared",
        strip,
        pageUrl: `${window.location.origin}/s/${strip.id}`,
      };
      cache.current = { blob, result };
      setState(result);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, []);

  const close = useCallback(() => setState({ status: "idle" }), []);

  return { state, share, close };
}