import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

type Props = {
  open: boolean;
  url: string | null;
  blob: Blob | null;
  onClose: () => void;
};

export function ShareDialog({ open, url, blob, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  // Keep the native <dialog> in sync with the `open` prop
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (!url) return;
    const file = blob ? new File([blob], "kimi-strip.png", { type: "image/png" }) : null;
    const data: ShareData =
      file && navigator.canShare?.({ files: [file] })
        ? { files: [file], title: "My Kimi strip", url }
        : { title: "My Kimi strip", url };
    try {
      await navigator.share(data);
    } catch {
      // user closed the share sheet — not an error
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()} // click on backdrop
      className="m-auto w-[min(92vw,380px)] rounded-card border border-line bg-paper p-0 text-ink shadow-card
        transition-[opacity,scale] duration-200 starting:scale-95 starting:opacity-0
        backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {url && (
        <div className="relative flex flex-col items-center gap-5 p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-ink-soft transition hover:bg-paper-deep hover:text-ink"
          >
            <X className="size-4" />
          </button>

          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Your strip is live
            </p>
            <h2 className="mt-1 font-display text-3xl">
              Pass it <em>around</em>
            </h2>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <QRCodeSVG value={url} size={176} fgColor="#1f1a17" bgColor="#ffffff" marginSize={0} />
          </div>

          <div className="flex w-full items-center gap-2 rounded-full border border-line bg-white py-1 pl-4 pr-1">
            <input
              readOnly
              value={url}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-ink-soft outline-none"
            />
            <Button variant="ghost" onClick={copyLink} className="h-9 px-3">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="flex w-full gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={buttonClasses("ghost", "flex-1")}>
              <ExternalLink className="size-4" />
              Open
            </a>
            {"share" in navigator && (
              <Button onClick={nativeShare} className="flex-1">
                <Share2 className="size-4" />
                Share…
              </Button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}