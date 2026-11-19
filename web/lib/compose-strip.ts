import { applyPalette, GIFEncoder, quantize, type Palette } from "gifenc";
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

type Fonts = { serif: string; mono: string };

async function loadFonts(): Promise<Fonts> {
  const serif = fontFamily("--font-instrument", "Georgia, serif");
  const mono = fontFamily("--font-geist-mono", "monospace");
  await Promise.all([document.fonts.load(`italic 72px ${serif}`), document.fonts.load(`24px ${mono}`)]);
  return { serif, mono };
}

function createContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");
  return { canvas, ctx };
}

export async function composeStrip(photos: string[], opts: StripOptions): Promise<Blob> {
  const [images, fonts] = await Promise.all([Promise.all(photos.map(loadImage)), loadFonts()]);
  const { width, height } = layoutSize(getLayout(opts.layout));
  const { canvas, ctx } = createContext(width, height);

  drawStrip(ctx, images, opts, fonts);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), "image/png"),
  );
}

const GIF_MAX_W = 480;
const GIF_MAX_H = 1200;
const GIF_DELAY_MS = 90;

/** Every slot plays its burst forward then backward, on a loop */
export async function composeGif(
  photos: string[],
  bursts: CanvasImageSource[][],
  opts: StripOptions,
): Promise<Blob> {
  const [stills, fonts] = await Promise.all([Promise.all(photos.map(loadImage)), loadFonts()]);
  const { width, height } = layoutSize(getLayout(opts.layout));
  const scale = Math.min(GIF_MAX_W / width, GIF_MAX_H / height, 1);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const { ctx } = createContext(w, h);

  const frames = Math.max(1, ...bursts.map((b) => b.length));
  const order = [...Array(frames).keys(), ...[...Array(frames).keys()].slice(1, -1).reverse()];

  const gif = GIFEncoder();
  let palette: Palette | undefined;

  for (const f of order) {
    const images = stills.map((still, i) => {
      const burst = bursts[i];
      return burst?.length ? burst[Math.min(f, burst.length - 1)] : still;
    });

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawStrip(ctx, images, opts, fonts);

    const { data } = ctx.getImageData(0, 0, w, h);
    const first = !palette;
    palette ??= quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), w, h, {
      delay: GIF_DELAY_MS,
      ...(first && { palette }),
    });
    await new Promise((r) => setTimeout(r, 0)); // keep the UI responsive
  }

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

function drawStrip(
  ctx: CanvasRenderingContext2D,
  images: CanvasImageSource[],
  opts: StripOptions,
  { serif, mono }: Fonts,
) {
  const layout = getLayout(opts.layout);
  const { width, height } = layoutSize(layout);

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
}