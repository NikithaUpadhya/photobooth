import { AnimatePresence, motion } from "motion/react";

type Props = { photos: string[]; total: number };

export function StripPreview({ photos, total }: Props) {
  return (
    <aside className="flex flex-col items-center">
      <div className="relative z-10 h-3 w-full max-w-[260px] rounded-full bg-ink/90 shadow-inner" />
      <div className="-mt-1.5 w-[220px] rounded-b-md bg-white p-3 pb-10 shadow-card">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="relative mb-3 grid aspect-[4/3] place-items-center overflow-hidden rounded-sm bg-paper-deep font-mono text-[10px] text-ink-soft last:mb-0"
          >
            {String(i + 1).padStart(2, "0")}
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
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        {photos.length === total ? "Fresh off the press" : "Your strip prints here"}
      </p>
    </aside>
  );
}