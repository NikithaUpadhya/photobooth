import { RotateCcw } from "lucide-react";

type Props = {
  photos: string[];
  retakeIndex: number | null;
  disabled?: boolean;
  filter?: string;
  aspect?: number;
  onRetake: (index: number) => void;
};

export function ShotThumbnails({
  photos,
  retakeIndex,
  disabled,
  filter,
  aspect = 4 / 3,
  onRetake,
}: Props) {
  return (
    <div className="mt-6">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        Tap a shot to retake it
      </p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {photos.map((src, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onRetake(i)}
            aria-label={`Retake shot ${i + 1}`}
            style={{ aspectRatio: aspect }}
            className={`group relative overflow-hidden rounded-lg transition
              hover:-translate-y-0.5 hover:shadow-card
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
              disabled:pointer-events-none
              ${retakeIndex === i ? "ring-2 ring-accent ring-offset-2 ring-offset-paper-deep" : ""}
              ${disabled && retakeIndex !== i ? "opacity-50" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={{ filter }} className="size-full object-cover" />

            <span className="absolute left-1.5 top-1.5 font-mono text-[9px] text-paper drop-shadow">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span
              className="absolute inset-0 grid place-items-center bg-ink/50 text-paper opacity-0 transition
                group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <RotateCcw className="size-5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}