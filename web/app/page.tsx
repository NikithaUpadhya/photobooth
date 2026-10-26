import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl italic">Lumière</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            photobooth
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          No. 001
        </span>
      </header>

      <main className="grid gap-10 pb-16 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Booth */}
        <section className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card sm:p-6">
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-ink">
            <Camera className="size-10 text-paper/30" strokeWidth={1.25} />
            <span className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              Live
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="font-display text-2xl">
              Strike a pose — <em>four times.</em>
            </p>
            <Button>
              <Sparkles className="size-4" />
              Start session
            </Button>
          </div>
        </section>

        {/* Strip slot */}
        <aside className="flex flex-col items-center">
          <div className="h-3 w-full max-w-[260px] rounded-full bg-ink/90 shadow-inner" />
          <div className="-mt-1.5 w-[220px] rounded-b-md bg-white p-3 pb-10 shadow-card">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 grid aspect-[4/3] place-items-center rounded-sm bg-paper-deep font-mono text-[10px] text-ink-soft last:mb-0"
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Your strip prints here
          </p>
        </aside>
      </main>
    </div>
  );
}