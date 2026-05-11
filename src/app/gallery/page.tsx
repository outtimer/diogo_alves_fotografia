import { prisma } from "@/lib/prisma";
import PortfolioGallery from "@/components/PortfolioGallery";
import Logo from "@/components/Logo";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="inline-block mb-8">
            <Logo className="w-12 h-12 text-zinc-950" />
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-zinc-950 italic leading-none tracking-tighter">
            Acervo <span className="text-zinc-300">Fotográfico</span>.
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-6 opacity-40 font-medium">Cronologia de Instantes</p>
        </header>

        <PortfolioGallery initialPhotos={photos} />
      </div>
    </div>
  );
}
