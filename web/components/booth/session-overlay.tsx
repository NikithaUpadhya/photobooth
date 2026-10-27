import { AnimatePresence, motion } from "motion/react";
import type { SessionPhase } from "@/hooks/use-photo-session";

type Props = {
  phase: SessionPhase;
  count: number;
  shotIndex: number;
  total: number;
};

export function SessionOverlay({ phase, count, shotIndex, total }: Props) {
  return (
    <>
      {/* Big countdown number */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.span
            key={`${shotIndex}-${count}`}
            initial={{ opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[9rem] leading-none text-paper drop-shadow-[0_4px_24px_rgb(0_0_0/0.45)]"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>

      {/* White camera flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            key={`flash-${shotIndex}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>

      {/* Shot progress: ● ● ○ ○ */}
      {phase !== "idle" && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/40 px-3 py-2 backdrop-blur">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors duration-300 ${
                i < shotIndex ? "bg-accent" : "bg-paper/40"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}