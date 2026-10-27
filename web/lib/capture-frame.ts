type Options = {
  aspect?: number; // width / height of the output
  maxWidth?: number;
  mirror?: boolean;
};

export function captureFrame(
  video: HTMLVideoElement,
  { aspect = 4 / 3, maxWidth = 1200, mirror = true }: Options = {},
): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null; // video not ready yet

  // 1. Work out the crop (same maths as object-fit: cover)
  let sx = 0, sy = 0, sw = vw, sh = vh;
  if (vw / vh > aspect) {
    // video is wider than we want → trim the sides
    sw = vh * aspect;
    sx = (vw - sw) / 2;
  } else {
    // video is taller than we want → trim top and bottom
    sh = vw / aspect;
    sy = (vh - sh) / 2;
  }

  // 2. Draw it onto an off-screen canvas
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(Math.min(maxWidth, sw));
  canvas.height = Math.round(canvas.width / aspect);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (mirror) {
    // flip horizontally so the photo matches the mirrored preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  // 3. Export as an image string
  return canvas.toDataURL("image/jpeg", 0.92);
}