import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />
      <main className="flex flex-col items-center gap-8 pb-20 pt-4" aria-busy="true">
        <div className="flex flex-col items-center gap-3">
          <div className="h-3 w-32 animate-pulse rounded bg-paper-deep motion-reduce:animate-none" />
          <div className="h-10 w-64 animate-pulse rounded bg-paper-deep motion-reduce:animate-none" />
        </div>
        <div className="aspect-[1020/3088] w-[240px] -rotate-2 animate-pulse rounded-md bg-paper-deep shadow-card motion-reduce:animate-none sm:w-[280px]" />
      </main>
    </div>
  );
}