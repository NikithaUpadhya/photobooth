export function StripPreview() {
  return (
    <aside className="flex flex-col items-center">
      {/* relative z-10 puts the slot on top of the strip */}
      <div className="relative z-10 h-3 w-full max-w-[260px] rounded-full bg-ink/90 shadow-inner" />
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
  );
}