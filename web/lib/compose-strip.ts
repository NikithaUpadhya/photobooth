export type StripOptions = {
  frameColor: string; 
  caption: string;
  showDate: boolean;
  rounded: boolean;
};

export const DEFAULT_STRIP: StripOptions = {
  frameColor: "#ffffff",
  caption: "Kimi",
  showDate: true,
  rounded: false,
};

// Layout in real pixels (output is ~1020 × 3088 px, sharp enough to print)
const PHOTO_W = 900;
const PHOTO_H = 675; // 4:3
const PAD = 60;
const GAP = 36;
const FOOTER = 220;
const RADIUS = 28;

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
}

/** next/font gives fonts generated names, so read the real one from the CSS variable */
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
  // 1. Load photos and fonts at the same time
  const serif = fontFamily("--font-instrument", "Georgia, serif");
  const mono = fontFamily("--font-geist-mono", "monospace");
  const [images] = await Promise.all([
    Promise.all(photos.map(loadImage)),
    document.fonts.load(`italic 72px ${serif}`),
    document.fonts.load(`24px ${mono}`),
  ]);

  // 2. Size the canvas
  const width = PHOTO_W + PAD * 2;
  const height = PAD + images.length * PHOTO_H + (images.length - 1) * GAP + FOOTER;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // 3. Frame background
  ctx.fillStyle = opts.frameColor;
  ctx.fillRect(0, 0, width, height);

  // 4. Photos (clipped to rounded corners if enabled)
  images.forEach((img, i) => {
    const x = PAD;
    const y = PAD + i * (PHOTO_H + GAP);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, PHOTO_W, PHOTO_H, opts.rounded ? RADIUS : 0);
    ctx.clip();
    ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
    ctx.restore();
  });

  // 5. Footer text, light or dark depending on the frame colour
  const footerTop = height - FOOTER;
  ctx.fillStyle = isDark(opts.frameColor) ? "#f4eee3" : "#1f1a17";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (opts.caption.trim()) {
    ctx.font = `italic 72px ${serif}`;
    ctx.fillText(opts.caption.trim(), width / 2, footerTop + FOOTER * 0.42, PHOTO_W);
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