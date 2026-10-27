import { PhotoBooth } from "@/components/booth/photo-booth";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
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

      <PhotoBooth />
    </div>
  );
}