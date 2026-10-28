export const FILTERS = [
  { id: "none", name: "Original", css: "none" },
  { id: "mono", name: "B&W", css: "grayscale(1) contrast(1.1)" },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.6) brightness(0.9)" },
  { id: "sepia", name: "Sepia", css: "sepia(0.8) contrast(1.05) brightness(1.05)" },
  { id: "warm", name: "Warm", css: "sepia(0.3) saturate(1.3) hue-rotate(-10deg) brightness(1.05)" },
  { id: "fade", name: "Faded", css: "contrast(0.85) brightness(1.1) saturate(0.7)" },
  { id: "vivid", name: "Vivid", css: "saturate(1.6) contrast(1.1)" },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export function filterCss(id: FilterId) {
  return FILTERS.find((f) => f.id === id)?.css ?? "none";
}
