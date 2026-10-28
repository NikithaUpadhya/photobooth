import { AnimatePresence, motion } from "motion/react";
import { formatDate, isDark, type StripOptions } from "@/lib/compose-strip";

type Props = {
  photos: string[];
  total: number;
  options: StripOptions;
  stripUrl?: string | null;
};

// Printer feed: move, pause, move, pause, drop.
// Defined outside the component so the object is the same on every render
// (a new object each render could make Motion restart the animation).
const PRINT_KEYFRAMES = { y: ["-100%", "-72%", "-72%", "-38%", "-38%", "0%"] };
const PRINT_TRANSITION = {
  duration: 2.4,
  times: [0, 0.2, 0.32, 0.58, 0.7, 1],
  ease: "easeOut" as const,
};

export function StripPreview({ photos, total, options, stripUrl }: Props) {
  const dark = isDark(options.frameColor);
  const allShot = photos.length === total;

  return (
    <aside className="flex flex-col items-center lg:sticky lg:top-6">
      {/* Printer slot */}
      <div className="relative z-10 h-3 w-full max-w-[260px] rounded-full bg-ink/90 shadow-inner" />

      {stripUrl ? (
        // Clip only the TOP edge (the part still inside the printer).
        // Negative insets on the other sides leave room for the shadow.
        <div className="-mt-1.5" style={{ clipPath: "inset(0 -60px -80px -60px)" }}>
          <motion.img
            key="final-strip"
            src={stripUrl}
            alt="Your photo strip"
            initial={{ y: "-100%" }}
            animate={PRINT_KEYFRAMES}
            transition={PRINT_TRANSITION}
            className="block w-[220px] rounded-b-md lg:w-[clamp(150px,calc((100dvh_-_10rem)_*_0.33),220px)] shadow-card"
          />
        </div>
      ) : (
        <div
          className="-mt-1.5 w-[220px] rounded-b-md lg:w-[clamp(150px,calc((100dvh_-_10rem)_*_0.33),220px)] px-3 pt-3 shadow-card transition-colors duration-300"
          style={{ backgroundColor: options.frameColor, color: dark ? "#f4eee3" : "#1f1a17" }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`relative mb-2.5 grid aspect-[4/3] place-items-center overflow-hidden font-mono text-[10px] transition-[border-radius] duration-300 last:mb-0
                ${options.rounded ? "rounded-md" : "rounded-none"}
                ${dark ? "bg-white/10" : "bg-black/5"}`}
            >
              <span className="opacity-50">{String(i + 1).padStart(2, "0")}</span>
              <AnimatePresence>
                {photos[i] && (
                  <motion.img
                    key={photos[i].slice(-24)}
                    src={photos[i]}
                    alt={`Shot ${i + 1}`}
                    initial={{ opacity: 0, filter: "brightness(2.2) blur(4px)" }}
                    animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}

          <div className="flex h-12 flex-col items-center justify-center">
            {options.caption.trim() && (
              <span className="max-w-full truncate font-display text-lg italic leading-none">
                {options.caption.trim()}
              </span>
            )}
            {options.showDate && (
              <span suppressHydrationWarning className="mt-1 font-mono text-[7px] tracking-[0.3em] opacity-60">
                {formatDate(new Date())}
              </span>
            )}
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        {stripUrl ? "Fresh off the press" : allShot ? "Printing…" : "Your strip prints here"}
      </p>
    </aside>
  );
}