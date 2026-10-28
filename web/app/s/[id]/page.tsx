/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonClasses } from "@/components/ui/button";
import { getStrip } from "@/lib/api";
import { formatDate } from "@/lib/compose-strip";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const strip = await getStrip(id);
  if (!strip) return { title: "Strip not found · Kimi" };

  const title = strip.caption ? `${strip.caption} · Kimi` : "A Kimi photo strip";
  return {
    title,
    description: "Made in a tiny photobooth that lives in the browser.",
    openGraph: {
      title,
      images: [{ url: strip.imageUrl }],
    },
  };
}

export default async function SharedStripPage({ params }: Props) {
  const { id } = await params;
  const strip = await getStrip(id);
  if (!strip) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />

      <main className="flex flex-col items-center gap-8 pb-20 pt-4">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Printed {formatDate(new Date(strip.createdAt))}
          </p>
          <h1 className="mt-2 font-display text-5xl">
            {strip.caption ? <em>{strip.caption}</em> : <>A little <em>strip</em></>}
          </h1>
        </div>

        <img
          src={strip.imageUrl}
          alt={strip.caption ? `Photo strip: ${strip.caption}` : "Photo strip"}
          className="h-auto max-h-[70dvh] w-auto max-w-[min(100%,560px)] -rotate-2 rounded-md shadow-card transition duration-500 hover:rotate-0"
        />

        <div className="flex flex-wrap justify-center gap-2">
          <a href={strip.downloadUrl} className={buttonClasses("ghost")}>
            <Download className="size-4" />
            Download
          </a>
          <Link href="/" className={buttonClasses("primary")}>
            <Sparkles className="size-4" />
            Make your own
          </Link>
        </div>
      </main>
    </div>
  );
}