"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, RotateCcw, Share2, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useComposedStrip } from "@/hooks/use-composed-strip";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { SHOTS, usePhotoSession } from "@/hooks/use-photo-session";
import { useShareStrip } from "@/hooks/use-share-strip";
import { captureFrame } from "@/lib/capture-frame";
import { DEFAULT_STRIP, type StripOptions } from "@/lib/compose-strip";
import { downloadFile } from "@/lib/download";
import { playShutter, playTick } from "@/lib/sounds";
import { CameraView } from "./camera-view";
import { SessionOverlay } from "./session-overlay";
import { ShareDialog } from "./share-dialog";
import { ShotThumbnails } from "./shot-thumbnails";
import { StripCustomizer } from "./strip-customizer";
import { StripPreview } from "./strip-preview";

export function PhotoBooth() {
  const { videoRef, status, start: startCamera } = useCamera();
  const [muted, setMuted] = useState(false);

  const capture = useCallback(
    () => (videoRef.current ? captureFrame(videoRef.current) : null),
    [videoRef],
  );

  const session = usePhotoSession(capture, {
    onTick: (n) => !muted && playTick(n === 1),
    onShutter: () => !muted && playShutter(),
  });

  const cameraReady = status === "ready";
  const isRetaking = session.retakeIndex !== null;
  const showThumbnails =
    session.photos.length === SHOTS && (session.phase === "done" || isRetaking);

  const [stripOptions, setStripOptions] = useState<StripOptions>(DEFAULT_STRIP);
  const debouncedOptions = useDebouncedValue(stripOptions, 150);
  const strip = useComposedStrip(session.photos, debouncedOptions, session.phase === "done");

  const sharing = useShareStrip();
  const uploading = sharing.state.status === "uploading";

  // Keyboard: Space = start, Esc = cancel
  const { isRunning, start, cancel } = session;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isRunning) {
        cancel();
        return;
      }
      // Don't hijack Space while typing or when a control has focus
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, button, a, [role], dialog")) return;

      if (e.code === "Space" && cameraReady && !isRunning) {
        e.preventDefault(); // stop the page from scrolling
        start();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cameraReady, isRunning, start, cancel]);

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
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              aria-pressed={muted}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-ink/40 text-paper/80 backdrop-blur transition hover:text-paper"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </CameraView>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="font-display text-2xl">
                {isRetaking ? (
                  <>Retaking <em>shot {session.retakeIndex! + 1}</em></>
                ) : session.isRunning ? (
                  <>Shot {Math.min(session.shotIndex + 1, SHOTS)} <em>of {SHOTS}</em></>
                ) : session.phase === "done" ? (
                  <>Lovely. <em>Want another go?</em></>
                ) : (
                  <>Strike a pose — <em>four times.</em></>
                )}
              </p>
              {cameraReady && (
                <p className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft md:block">
                  {session.isRunning ? (
                    <><Kbd>Esc</Kbd> to cancel</>
                  ) : (
                    <><Kbd>Space</Kbd> to {session.phase === "done" ? "retake all" : "start"}</>
                  )}
                </p>
              )}
            </div>

            {session.phase === "done" ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="ghost" onClick={session.start}>
                  <RotateCcw className="size-4" />
                  Retake all
                </Button>
                <Button
                  variant="ghost"
                  disabled={!strip || uploading}
                  onClick={() => strip && sharing.share(strip.blob, debouncedOptions)}
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                  {uploading ? "Uploading…" : "Share"}
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

          {sharing.state.status === "error" && (
            <p role="alert" className="mt-3 text-center text-sm text-accent sm:text-right">
              {sharing.state.message}
            </p>
          )}

          {showThumbnails && (
            <ShotThumbnails
              photos={session.photos}
              retakeIndex={session.retakeIndex}
              disabled={session.isRunning}
              onRetake={session.retake}
            />
          )}
        </section>

        <StripCustomizer value={stripOptions} onChange={setStripOptions} />
      </div>

      <StripPreview
        photos={session.photos}
        total={SHOTS}
        options={stripOptions}
        stripUrl={strip?.url}
      />

      <ShareDialog
        open={sharing.state.status === "shared"}
        url={sharing.state.status === "shared" ? sharing.state.pageUrl : null}
        blob={strip?.blob ?? null}
        onClose={sharing.close}
      />
    </main>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-ink">
      {children}
    </kbd>
  );
}