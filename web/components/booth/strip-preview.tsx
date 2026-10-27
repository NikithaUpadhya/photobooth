import { AnimatePresence, motion } from "motion/react";
import { formatDate, isDark, type StripOptions } from "@/lib/compose-strip";

type Props = {
  photos: string[];
  total: number;
  options: StripOptions;
  stripUrl?: string | null;
};

export function StripPreview({ photos, total, options, stripUrl }: Props) {
  const dark = isDark(options.frameColor);

  return (
    <aside className="flex flex-col items-center lg:sticky lg:top-6">
      {/* Printer slot */}
      <div className="relative z-10 h-3 w-full max-w-[260px] rounded-full bg-ink/90 shadow-inner" />

      {stripUrl ? (
        // Final composed PNG
        <motion.img
          key="final-strip"
          src={stripUrl}
          alt="Your photo strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="-mt-1.5 w-[220px] rounded-b-md shadow-card"
        />
      ) : (
        // Live CSS preview, styled with the current options
        <div
          className="-mt-1.5 w-[220px] rounded-b-md px-3 pt-3 shadow-card transition-colors duration-300"
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

          {/* Footer: caption + date, mirrors the canvas layout */}
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
        {photos.length === total ? "Fresh off the press" : "Your strip prints here"}
      </p>
    </aside>
  );
}