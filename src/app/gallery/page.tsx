import { prisma } from "@/lib/prisma";
import PortfolioGallery from "@/components/PortfolioGallery";
import Logo from "@/components/Logo";

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  let photos: any[] = [];
  let categories: any[] = [];
  try {
    const [fetchedPhotos, fetchedCategories] = await Promise.all([
      prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }).catch(() => [])
    ]);
    photos = fetchedPhotos;
    categories = fetchedCategories;
  } catch (error) {
    console.warn("Error fetching gallery data:", error);
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6 lg:pt-48 lg:pb-32 3xl:pt-64 3xl:pb-48">
      <div className="max-w-7xl 2xl:max-w-[1700px] 3xl:max-w-[2400px] mx-auto">
        <header className="mb-20 3xl:mb-32">
          <div className="inline-block mb-8 3xl:mb-16">
            <Logo className="w-12 h-12 lg:w-16 lg:h-16 3xl:w-24 3xl:h-24 text-zinc-950" />
          </div>
          <h1 className="font-display text-5xl md:text-8xl lg:text-9xl 3xl:text-[12rem] text-zinc-950 italic leading-none tracking-tighter text-balance">
            Acervo <span className="text-zinc-300">Fotográfico</span>.
          </h1>
          <p className="text-[10px] lg:text-xs 3xl:text-base uppercase tracking-[0.4em] mt-6 3xl:mt-12 opacity-40 font-medium">Cronologia de Instantes</p>
        </header>

        <PortfolioGallery 
          initialPhotos={photos} 
          initialCategories={categories}
        />
      </div>
    </div>
  );
}
