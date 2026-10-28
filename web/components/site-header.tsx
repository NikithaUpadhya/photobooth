import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="font-display text-3xl italic">Lumière</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          photobooth
        </span>
      </Link>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        No. 001
      </span>
    </header>
  );
}