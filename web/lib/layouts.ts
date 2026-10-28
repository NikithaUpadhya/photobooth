export const PAD = 60;
export const GAP = 36;
export const RADIUS = 28;

export const LAYOUTS = [
  { id: "strip", name: "Strip", shots: 4, cols: 1, photoW: 900, photoH: 675, footer: 220, previewW: 220 },
  { id: "trio", name: "Trio", shots: 3, cols: 1, photoW: 900, photoH: 675, footer: 220, previewW: 240 },
  { id: "grid", name: "Grid", shots: 4, cols: 2, photoW: 900, photoH: 675, footer: 220, previewW: 300 },
  { id: "polaroid", name: "Polaroid", shots: 1, cols: 1, photoW: 900, photoH: 900, footer: 300, previewW: 260 },
] as const;

export type Layout = (typeof LAYOUTS)[number];
export type LayoutId = Layout["id"];

export function getLayout(id: LayoutId): Layout {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function isCompatible(a: Layout, b: Layout) {
  return a.shots === b.shots && a.photoW * b.photoH === b.photoW * a.photoH;
}

export function layoutSize(l: Layout) {
  const rows = Math.ceil(l.shots / l.cols);
  return {
    width: PAD * 2 + l.cols * l.photoW + (l.cols - 1) * GAP,
    height: PAD + rows * l.photoH + (rows - 1) * GAP + l.footer,
  };
}

export function photoRect(l: Layout, i: number) {
  const col = i % l.cols;
  const row = Math.floor(i / l.cols);
  return {
    x: PAD + col * (l.photoW + GAP),
    y: PAD + row * (l.photoH + GAP),
    w: l.photoW,
    h: l.photoH,
  };
}
