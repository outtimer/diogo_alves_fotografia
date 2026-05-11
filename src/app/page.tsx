import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FeaturedGrid from "@/components/FeaturedGrid";
import BlogSection from "@/components/BlogSection";
import { getSiteContent } from "./admin/actions";

export default async function Home() {
  const [photos, content] = await Promise.all([
    prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    getSiteContent()
  ]);

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white">
      <Hero content={content} />

      {/* About Section */}
      <AboutSection content={content} />

      {/* Featured Section */}
      <FeaturedGrid photos={photos} title={content["home_gallery_title"] || "Galeria em Foco"} />

      {/* Blog Section */}
      <BlogSection title={content["home_blog_title"] || "Últimas Histórias"} />

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-24 px-6 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h4 className="font-display text-3xl text-zinc-950 italic mb-4">
              {content["footer_cta_title"] || "Interessado em apoiar uma expedição?"}
            </h4>
            <p className="text-sm text-zinc-500 mb-8 max-w-sm leading-relaxed">
              {content["footer_cta_desc"] || "Estou sempre em busca de parceiros para patrocinar novas jornadas fotográficas e documentar locais únicos ao redor do mundo."}
            </p>
            <p className="text-[11px] uppercase tracking-widest opacity-50">© 2024 Aura Portfolio. Built for clarity.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex space-x-8">
              <a href={content["social_instagram"] || "#"} className="text-[10px] uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={content["social_twitter"] || "#"} className="text-[10px] uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1" target="_blank" rel="noopener noreferrer">Twitter</a>
              <Link href="/contact" className="text-[10px] uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Email</Link>
            </div>
            <div className="h-[1px] w-48 bg-zinc-200"></div>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 text-zinc-900">
              {content["footer_tagline"] || "Sao Paulo | Tokyo | Zurich"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
