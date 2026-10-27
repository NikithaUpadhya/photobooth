"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { CameraView } from "./camera-view";
import { StripPreview } from "./strip-preview";

export function PhotoBooth() {
  const { videoRef, status, start } = useCamera();

  return (
    <main className="grid gap-10 pb-16 lg:grid-cols-[1fr_320px] lg:items-start">
      <section className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card sm:p-6">
        <CameraView videoRef={videoRef} status={status} onStart={start} />

        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="font-display text-2xl">
            Strike a pose — <em>four times.</em>
          </p>
          <Button disabled={status !== "ready"}>
            <Sparkles className="size-4" />
            Start session
          </Button>
        </div>
      </section>

      <StripPreview />
    </main>
  );
}