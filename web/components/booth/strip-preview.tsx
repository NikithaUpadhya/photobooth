import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatDate, isDark, type StripOptions } from "@/lib/compose-strip";
import { filterCss } from "@/lib/filters";
import { getLayout, layoutSize, PAD, photoRect, RADIUS } from "@/lib/layouts";

type Props = {
  photos: string[];
  options: StripOptions;
  stripUrl?: string | null;
};

const PRINT_KEYFRAMES = { y: ["-100%", "-72%", "-72%", "-38%", "-38%", "0%"] };
const PRINT_TRANSITION = {
  duration: 2.4,
  times: [0, 0.2, 0.32, 0.58, 0.7, 1],
  ease: "easeOut" as const,
};

// Max width on phones; on desktop it also shrinks to fit the window height
const SIZE = "w-[var(--w)] lg:w-[clamp(150px,calc((100dvh_-_10rem)_*_var(--r)),var(--w))]";

export function StripPreview({ photos, options, stripUrl }: Props) {
  const layout = getLayout(options.layout);
  const { width: W, height: H } = layoutSize(layout);
  const dark = isDark(options.frameColor);
  const allShot = photos.length === layout.shots;

  const pctX = (px: number) => `${(px / W) * 100}%`;
  const pctY = (px: number) => `${(px / H) * 100}%`;
  const cqw = (px: number) => `${(px / W) * 100}cqw`;
  const footerTop = H - layout.footer;

  return (
    <aside
      className="flex flex-col items-center lg:sticky lg:top-6"
      style={{ "--w": `${layout.previewW}px`, "--r": W / H } as CSSProperties}
    >
      {/* Printer slot */}
      <div className="relative z-10 h-3 w-[calc(var(--w)_+_40px)] max-w-full rounded-full bg-ink/90 shadow-inner" />

      {stripUrl ? (
        <div className="-mt-1.5" style={{ clipPath: "inset(0 -60px -80px -60px)" }}>
          <motion.img
            key="final-strip"
            src={stripUrl}
            alt="Your photo strip"
            initial={{ y: "-100%" }}
            animate={PRINT_KEYFRAMES}
            transition={PRINT_TRANSITION}
            className={`block rounded-b-md shadow-card ${SIZE}`}
          />
        </div>
      ) : (
        <div className={`@container -mt-1.5 ${SIZE}`}>
          <div
            className="relative rounded-b-md shadow-card transition-colors duration-300"
            style={{
              aspectRatio: `${W} / ${H}`,
              backgroundColor: options.frameColor,
              color: dark ? "#f4eee3" : "#1f1a17",
            }}
          >
            {Array.from({ length: layout.shots }).map((_, i) => {
              const r = photoRect(layout, i);
              return (
                <div
                  key={i}
                  className={`absolute grid place-items-center overflow-hidden font-mono text-[10px] transition-[border-radius] duration-300
                    ${dark ? "bg-white/10" : "bg-black/5"}`}
                  style={{
                    left: pctX(r.x),
                    top: pctY(r.y),
                    width: pctX(r.w),
                    height: pctY(r.h),
                    borderRadius: options.rounded ? cqw(RADIUS) : 0,
                  }}
                >
                  <span className="opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  <div className="absolute inset-0" style={{ filter: filterCss(options.filter) }}>
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
                </div>
              );
            })}

            {options.caption.trim() && (
              <span
                className="absolute -translate-y-1/2 truncate text-center font-display italic leading-none"
                style={{
                  left: pctX(PAD),
                  right: pctX(PAD),
                  top: pctY(footerTop + layout.footer * 0.42),
                  fontSize: cqw(72),
                }}
              >
                {options.caption.trim()}
              </span>
            )}
            {options.showDate && (
              <span
                suppressHydrationWarning
                className="absolute inset-x-0 -translate-y-1/2 text-center font-mono leading-none opacity-60"
                style={{
                  top: pctY(footerTop + layout.footer * 0.74),
                  fontSize: cqw(24),
                  letterSpacing: cqw(6),
                }}
              >
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
