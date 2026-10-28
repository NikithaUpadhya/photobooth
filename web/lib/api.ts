import type { StripOptions } from "@/lib/compose-strip";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type SharedStrip = {
  id: string;
  caption: string | null;
  frameColor: string;
  imageUrl: string;
  downloadUrl: string;
  createdAt: string; // JSON turns Date into an ISO string
};

/** Nest error bodies look like { message: string | string[], ... } */
async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  const msg = body?.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg ?? `${fallback} (${res.status})`);
}

export async function uploadStrip(blob: Blob, options: StripOptions): Promise<SharedStrip> {
  const form = new FormData();
  form.append("file", blob, "strip.png");
  form.append("frameColor", options.frameColor);
  if (options.caption.trim()) form.append("caption", options.caption.trim());

  const res = await fetch(`${API_URL}/strips`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res, "Upload failed"));
  return res.json();
}

export async function getStrip(id: string): Promise<SharedStrip | null> {
  const res = await fetch(`${API_URL}/strips/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 }, 
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await readError(res, "Could not load strip"));
  return res.json();
}