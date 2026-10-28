import type { RefObject, ReactNode } from "react";
import { Camera, CameraOff, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CameraStatus } from "@/hooks/use-camera";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  onStart: () => void;
  children?: ReactNode;
};

const messages: Record<Exclude<CameraStatus, "ready">, { title: string; body: string }> = {
  idle: { title: "Your camera is off", body: "We only use it here, in your browser." },
  requesting: { title: "Waiting for permission…", body: "Check the prompt at the top of your browser." },
  denied: {
    title: "Camera access was blocked",
    body: "Click the camera icon in the address bar, allow access, then try again.",
  },
  unavailable: { title: "No camera found", body: "Plug one in or try another device." },
  error: { title: "Couldn't start the camera", body: "It may be in use by another app." },
};

export function CameraView({ videoRef, status, onStart, children }: Props) {
  const ready = status === "ready";

  return (
    <div className="relative mx-auto grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl bg-ink lg:max-w-[max(24rem,calc((100dvh_-_18rem)_*_4/3))]">
      {/* Always rendered so the ref exists before start() runs */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 size-full -scale-x-100 object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"
          }`}
      />

      {ready ? (
        <>
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/80 backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            Live
          </span>
          {children}
        </>
      ) : (
        <div className="relative flex max-w-xs flex-col items-center gap-3 px-6 text-center text-paper">
          {status === "requesting" ? (
            <Loader2 className="size-9 animate-spin text-paper/40" strokeWidth={1.25} />
          ) : status === "idle" ? (
            <Camera className="size-9 text-paper/40" strokeWidth={1.25} />
          ) : (
            <CameraOff className="size-9 text-accent" strokeWidth={1.25} />
          )}

          <p className="font-display text-2xl">{messages[status].title}</p>
          <p className="text-sm text-paper/60">{messages[status].body}</p>

          {status !== "requesting" && status !== "unavailable" && (
            <Button className="mt-2" onClick={onStart}>
              {status === "idle" ? <Camera className="size-4" /> : <RotateCcw className="size-4" />}
              {status === "idle" ? "Turn on camera" : "Try again"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}