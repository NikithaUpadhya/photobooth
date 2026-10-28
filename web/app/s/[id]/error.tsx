"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonClasses } from "@/components/ui/button";

export default function StripError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />
      <main className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Hmm</p>
        <h1 className="font-display text-5xl">
          The darkroom is <em>closed.</em>
        </h1>
        <p className="max-w-sm text-ink-soft">
          We couldn&apos;t reach the server to fetch this strip. Try again in a moment.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={reset}>Try again</Button>
          <Link href="/" className={buttonClasses("primary")}>Take a new one</Link>
        </div>
      </main>
    </div>
  );
}