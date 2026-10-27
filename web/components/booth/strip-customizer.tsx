import type { ReactNode } from "react";
import { Check, Pipette } from "lucide-react";
import { isDark, type StripOptions } from "@/lib/compose-strip";

const SWATCHES = [
  { name: "Paper", value: "#ffffff" },
  { name: "Cream", value: "#f4eee3" },
  { name: "Ink", value: "#1f1a17" },
  { name: "Tomato", value: "#c8553d" },
  { name: "Sage", value: "#9caf88" },
  { name: "Sky", value: "#a7c4dc" },
  { name: "Blush", value: "#f2c4c4" },
  { name: "Butter", value: "#f3dd8e" },
];

type Props = {
  value: StripOptions;
  onChange: (next: StripOptions) => void;
};

export function StripCustomizer({ value, onChange }: Props) {
  const set = <K extends keyof StripOptions>(key: K, v: StripOptions[K]) =>
    onChange({ ...value, [key]: v });

  const isCustomColor = !SWATCHES.some((s) => s.value === value.frameColor);
  const ring = "ring-2 ring-ink ring-offset-2 ring-offset-paper-deep";

  return (
    <section className="rounded-card border border-line bg-paper-deep/60 p-4 shadow-card sm:p-6">
      <h2 className="font-display text-2xl">
        Make it <em>yours</em>
      </h2>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {/* Frame colour */}
        <Field label="Frame">
          <div role="radiogroup" aria-label="Frame colour" className="flex flex-wrap gap-2">
            {SWATCHES.map((s) => {
              const active = s.value === value.frameColor;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={s.name}
                  title={s.name}
                  onClick={() => set("frameColor", s.value)}
                  style={{ backgroundColor: s.value }}
                  className={`grid size-8 place-items-center rounded-full border border-ink/15 transition hover:scale-110
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? ring : ""}`}
                >
                  {active && (
                    <Check
                      strokeWidth={3}
                      className={`size-3.5 ${isDark(s.value) ? "text-paper" : "text-ink"}`}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom colour */}
            <label
              title="Custom colour"
              className={`relative grid size-8 cursor-pointer place-items-center rounded-full border border-ink/15
                bg-[conic-gradient(#f87171,#facc15,#4ade80,#22d3ee,#818cf8,#f472b6,#f87171)] transition hover:scale-110
                ${isCustomColor ? ring : ""}`}
            >
              <Pipette className="size-3.5 text-white drop-shadow" />
              <input
                type="color"
                aria-label="Custom frame colour"
                value={value.frameColor}
                onChange={(e) => set("frameColor", e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </Field>

        {/* Corners */}
        <Field label="Corners">
          <div
            role="radiogroup"
            aria-label="Photo corners"
            className="inline-flex w-fit rounded-full border border-line bg-paper p-1"
          >
            {([["Square", false], ["Rounded", true]] as const).map(([label, rounded]) => {
              const active = value.rounded === rounded;
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("rounded", rounded)}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${
                    active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Caption */}
        <Field label="Caption">
          <input
            type="text"
            aria-label="Caption"
            value={value.caption}
            maxLength={24}
            placeholder="Leave empty for none"
            onChange={(e) => set("caption", e.target.value)}
            className="h-10 w-full rounded-full border border-line bg-paper px-4 font-display text-lg italic
              placeholder:font-sans placeholder:text-sm placeholder:not-italic placeholder:text-ink-soft/60
              focus:border-ink focus:outline-none"
          />
        </Field>

        {/* Date stamp */}
        <Field label="Date stamp">
          <button
            type="button"
            role="switch"
            aria-checked={value.showDate}
            onClick={() => set("showDate", !value.showDate)}
            className="flex w-fit items-center gap-3 text-sm"
          >
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                value.showDate ? "bg-accent" : "bg-line"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  value.showDate ? "translate-x-5" : ""
                }`}
              />
            </span>
            {value.showDate ? "On" : "Off"}
          </button>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{label}</span>
      {children}
    </div>
  );
}