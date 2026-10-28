import { PhotoBooth } from "@/components/booth/photo-booth";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteHeader />
      <PhotoBooth />
    </div>
  );
}