"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useComposedStrip } from "@/hooks/use-composed-strip";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePhotoSession } from "@/hooks/use-photo-session";
import { useShareStrip } from "@/hooks/use-share-strip";
import { captureFrame } from "@/lib/capture-frame";
import { DEFAULT_STRIP, type StripOptions } from "@/lib/compose-strip";
import { downloadFile } from "@/lib/download";
import { filterCss } from "@/lib/filters";
import { getLayout, isCompatible, LAYOUTS, type LayoutId } from "@/lib/layouts";
import { playShutter, playTick } from "@/lib/sounds";
import { CameraView } from "./camera-view";
import { LayoutPicker } from "./layout-picker";
import { SessionOverlay } from "./session-overlay";
import { ShareDialog } from "./share-dialog";
import { ShotThumbnails } from "./shot-thumbnails";
import { StripCustomizer } from "./strip-customizer";
import { StripPreview } from "./strip-preview";

type Step = "shoot" | "design";

const TIMES = ["once", "twice", "three times", "four times"];

export function PhotoBooth() {
  const { videoRef, status, start: startCamera } = useCamera();
  const [step, setStep] = useState<Step>("shoot");
  const [muted, setMuted] = useState(false);

  const [stripOptions, setStripOptions] = useState<StripOptions>(DEFAULT_STRIP);
  const layout = getLayout(stripOptions.layout);
  const shots = layout.shots;
  const aspect = layout.photoW / layout.photoH;

  const capture = useCallback(
    () => (videoRef.current ? captureFrame(videoRef.current, { aspect }) : null),
    [videoRef, aspect],
  );

  const session = usePhotoSession(capture, shots, {
    onTick: (n) => !muted && playTick(n === 1),
    onShutter: () => !muted && playShutter(),
  });

  const cameraReady = status === "ready";
  const isRetaking = session.retakeIndex !== null;
  const showThumbnails =
    session.photos.length === shots && (session.phase === "done" || isRetaking);

  function changeLayout(id: LayoutId) {
    if (!isCompatible(layout, getLayout(id))) session.reset(); // photos no longer fit
    setStripOptions((o) => ({ ...o, layout: id }));
  }

  const debouncedOptions = useDebouncedValue(stripOptions, 150);
  const strip = useComposedStrip(session.photos, debouncedOptions, session.phase === "done");

  const sharing = useShareStrip();
  const uploading = sharing.state.status === "uploading";

  // Move focus to the new step so keyboard/screen-reader users land in the right place
  const boothRef = useRef<HTMLElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const hasChangedStep = useRef(false);
  useEffect(() => {
    if (!hasChangedStep.current) return;
    (step === "design" ? designRef : boothRef).current?.focus({ preventScroll: true });
  }, [step]);

  function goTo(next: Step) {
    hasChangedStep.current = true;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Keyboard: Space = start, Esc = cancel (shoot step only)
  const { isRunning, start, cancel } = session;
  useEffect(() => {
    if (step !== "shoot") return;

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
  }, [step, cameraReady, isRunning, start, cancel]);

  return (
    <main className="grid gap-10 pb-16 lg:pb-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-6">
        <StepIndicator step={step} />

        {/* Step 1: Booth. Hidden (not unmounted) so the <video> keeps its camera stream */}
        <div hidden={step !== "shoot"}>
          <section
            ref={boothRef}
            tabIndex={-1}
            className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card outline-none sm:p-6"
          >
            <CameraView
              videoRef={videoRef}
              status={status}
              onStart={startCamera}
              filter={filterCss(stripOptions.filter)}
              aspect={aspect}
            >
              <SessionOverlay
                phase={session.phase}
                count={session.count}
                shotIndex={session.shotIndex}
                total={shots}
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
                    <>Shot {Math.min(session.shotIndex + 1, shots)} <em>of {shots}</em></>
                  ) : session.phase === "done" ? (
                    <>Lovely. <em>{shots === 1 ? "Happy with it?" : "Happy with them?"}</em></>
                  ) : shots === 1 ? (
                    <>Strike a pose — <em>just one.</em></>
                  ) : (
                    <>Strike a pose — <em>{TIMES[shots - 1]}.</em></>
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
                  <Button onClick={() => goTo("design")}>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button disabled={!cameraReady || session.isRunning} onClick={session.start}>
                  <Sparkles className="size-4" />
                  {session.isRunning ? "Shooting…" : "Start session"}
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Layout
              </span>
              <LayoutPicker
                layouts={LAYOUTS}
                value={stripOptions.layout}
                onChange={changeLayout}
                disabled={session.isRunning}
              />
            </div>

            {showThumbnails && (
              <ShotThumbnails
                photos={session.photos}
                retakeIndex={session.retakeIndex}
                disabled={session.isRunning}
                filter={filterCss(stripOptions.filter)}
                aspect={aspect}
                onRetake={session.retake}
              />
            )}
          </section>
        </div>

        {/* Step 2: Design */}
        {step === "design" && (
          <motion.div
            ref={designRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 outline-none"
          >
            <StripCustomizer
              value={stripOptions}
              onChange={setStripOptions}
              samplePhoto={session.photos[0]}
              layoutChoices={LAYOUTS.filter((l) => isCompatible(l, layout))}
            />

            <section className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card sm:p-6">
              <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goTo("shoot")}>
                  <ArrowLeft className="size-4" />
                  Back to photos
                </Button>

                <div className="flex flex-wrap justify-center gap-2">
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
                    onClick={() => strip && downloadFile(strip.url, `kimi-${Date.now()}.png`)}
                  >
                    <Download className="size-4" />
                    Download
                  </Button>
                </div>
              </div>

              {sharing.state.status === "error" && (
                <p role="alert" className="mt-3 text-center text-sm text-accent sm:text-right">
                  {sharing.state.message}
                </p>
              )}
            </section>
          </motion.div>
        )}
      </div>

      <StripPreview
        photos={session.photos}
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

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "shoot", label: "Shoot" },
    { id: "design", label: "Design" },
  ];

  return (
    <ol className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
      {steps.map((s, i) => {
        const active = s.id === step;
        return (
          <li key={s.id} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="h-px w-8 bg-line" />}
            <span
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 transition-colors ${active ? "text-ink" : "text-ink-soft/60"}`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] tracking-normal transition-colors ${
                  active ? "bg-ink text-paper" : "border border-line"
                }`}
              >
                {i + 1}
              </span>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-ink">
      {children}
    </kbd>
  );
}