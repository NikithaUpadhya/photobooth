import { filterCss, type FilterId } from "@/lib/filters";
import { getLayout, layoutSize, PAD, photoRect, RADIUS, type LayoutId } from "@/lib/layouts";

export type StripOptions = {
  layout: LayoutId;
  frameColor: string;
  caption: string;
  showDate: boolean;
  rounded: boolean;
  filter: FilterId;
};

export const DEFAULT_STRIP: StripOptions = {
  layout: "strip",
  frameColor: "#ffffff",
  caption: "Kimi",
  showDate: true,
  rounded: false,
  filter: "none",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
}

function fontFamily(cssVar: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

export function isDark(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140; // perceived brightness
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(d)
    .toUpperCase(); // "27 OCT 2026"
}

export async function composeStrip(photos: string[], opts: StripOptions): Promise<Blob> {
  const serif = fontFamily("--font-instrument", "Georgia, serif");
  const mono = fontFamily("--font-geist-mono", "monospace");
  const [images] = await Promise.all([
    Promise.all(photos.map(loadImage)),
    document.fonts.load(`italic 72px ${serif}`),
    document.fonts.load(`24px ${mono}`),
  ]);

  // 2. Size the canvas
  const layout = getLayout(opts.layout);
  const { width, height } = layoutSize(layout);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // 3. Frame background
  ctx.fillStyle = opts.frameColor;
  ctx.fillRect(0, 0, width, height);

  images.forEach((img, i) => {
    const { x, y, w, h } = photoRect(layout, i);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, opts.rounded ? RADIUS : 0);
    ctx.clip();
    ctx.filter = filterCss(opts.filter); // reset by restore()
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  });

  const FOOTER = layout.footer;
  const footerTop = height - FOOTER;
  ctx.fillStyle = isDark(opts.frameColor) ? "#f4eee3" : "#1f1a17";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (opts.caption.trim()) {
    ctx.font = `italic 72px ${serif}`;
    ctx.fillText(opts.caption.trim(), width / 2, footerTop + FOOTER * 0.42, width - PAD * 2);
  }

  if (opts.showDate) {
    ctx.font = `24px ${mono}`;
    ctx.letterSpacing = "6px";
    ctx.globalAlpha = 0.6;
    ctx.fillText(formatDate(new Date()), width / 2, footerTop + FOOTER * 0.74);
    ctx.globalAlpha = 1;
    ctx.letterSpacing = "0px";
  }

  // 6. Export as a PNG Blob
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), "image/png"),
  );
}