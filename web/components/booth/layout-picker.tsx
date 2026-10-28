import { layoutSize, photoRect, type Layout, type LayoutId } from "@/lib/layouts";

type Props = {
  layouts: readonly Layout[];
  value: LayoutId;
  onChange: (id: LayoutId) => void;
  disabled?: boolean;
};

export function LayoutPicker({ layouts, value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Layout"
      className="inline-flex w-fit flex-wrap gap-1 rounded-full border border-line bg-paper p-1"
    >
      {layouts.map((l) => {
        const active = l.id === value;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(l.id)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition
              disabled:pointer-events-none disabled:opacity-50
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
              ${active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
          >
            <LayoutGlyph layout={l} />
            {l.name}
          </button>
        );
      })}
    </div>
  );
}

function LayoutGlyph({ layout }: { layout: Layout }) {
  const { width, height } = layoutSize(layout);
  return (
    <span
      aria-hidden
      className="relative block h-4 rounded-[2px] border border-current"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {Array.from({ length: layout.shots }).map((_, i) => {
        const r = photoRect(layout, i);
        return (
          <span
            key={i}
            className="absolute bg-current opacity-60"
            style={{
              left: `${(r.x / width) * 100}%`,
              top: `${(r.y / height) * 100}%`,
              width: `${(r.w / width) * 100}%`,
              height: `${(r.h / height) * 100}%`,
            }}
          />
        );
      })}
    </span>
  );
}
