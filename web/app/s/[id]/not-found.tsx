import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonClasses } from "@/components/ui/button";

export default function StripNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />
      <main className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">404</p>
        <h1 className="font-display text-5xl">
          This strip <em>wandered off.</em>
        </h1>
        <p className="max-w-sm text-ink-soft">
          The link might be mistyped, or the strip was never printed.
        </p>
        <Link href="/" className={buttonClasses("primary", "mt-4")}>
          Take a new one
        </Link>
      </main>
    </div>
  );
}