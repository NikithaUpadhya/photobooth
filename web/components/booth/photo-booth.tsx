"use client";

import { useCallback, useState } from "react";
import { Download, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useComposedStrip } from "@/hooks/use-composed-strip";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { SHOTS, usePhotoSession } from "@/hooks/use-photo-session";
import { captureFrame } from "@/lib/capture-frame";
import { DEFAULT_STRIP, type StripOptions } from "@/lib/compose-strip";
import { downloadFile } from "@/lib/download";
import { CameraView } from "./camera-view";
import { SessionOverlay } from "./session-overlay";
import { StripCustomizer } from "./strip-customizer";
import { StripPreview } from "./strip-preview";

export function PhotoBooth() {
  const { videoRef, status, start: startCamera } = useCamera();

  const capture = useCallback(
    () => (videoRef.current ? captureFrame(videoRef.current) : null),
    [videoRef],
  );

  const session = usePhotoSession(capture);
  const cameraReady = status === "ready";

  const [stripOptions, setStripOptions] = useState<StripOptions>(DEFAULT_STRIP);
  const debouncedOptions = useDebouncedValue(stripOptions, 150);
  const strip = useComposedStrip(session.photos, debouncedOptions, session.phase === "done");

  return (
    <main className="grid gap-10 pb-16 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-6">
        {/* Booth */}
        <section className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card sm:p-6">
          <CameraView videoRef={videoRef} status={status} onStart={startCamera}>
            <SessionOverlay
              phase={session.phase}
              count={session.count}
              shotIndex={session.shotIndex}
              total={SHOTS}
            />
          </CameraView>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="font-display text-2xl">
              {session.isRunning ? (
                <>Shot {Math.min(session.shotIndex + 1, SHOTS)} <em>of {SHOTS}</em></>
              ) : session.phase === "done" ? (
                <>Lovely. <em>Want another go?</em></>
              ) : (
                <>Strike a pose — <em>four times.</em></>
              )}
            </p>

            {session.phase === "done" ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={session.start}>
                  <RotateCcw className="size-4" />
                  Retake all
                </Button>
                <Button
                  disabled={!strip}
                  onClick={() => strip && downloadFile(strip.url, `lumiere-${Date.now()}.png`)}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            ) : (
              <Button disabled={!cameraReady || session.isRunning} onClick={session.start}>
                <Sparkles className="size-4" />
                {session.isRunning ? "Shooting…" : "Start session"}
              </Button>
            )}
          </div>
        </section>

        {/* Customiser */}
        <StripCustomizer value={stripOptions} onChange={setStripOptions} />
      </div>

      <StripPreview
        photos={session.photos}
        total={SHOTS}
        options={stripOptions}
        stripUrl={strip?.url}
      />
    </main>
  );
}