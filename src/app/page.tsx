import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FeaturedGrid from "@/components/FeaturedGrid";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import { getSiteContent } from "./admin/actions";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let photos: any[] = [];
  let content: Record<string, string> = {};

  try {
    const [fetchedPhotos, fetchedContent] = await Promise.all([
      prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }).catch(e => {
        console.warn("Photo table missing or DB not initialized:", e.message);
        return [];
      }),
      getSiteContent()
    ]);
    photos = fetchedPhotos;
    content = fetchedContent;
  } catch (error) {
    console.error("Critical error fetching home data:", error);
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white">
      <Hero content={content} />

      {/* About Section */}
      <AboutSection content={content} />

      {/* Featured Section */}
      <FeaturedGrid 
        photos={photos} 
        title={content["home_gallery_title"] || "Galeria em Foco"} 
      />

      {/* Blog Section */}
      {content["show_blog"] === "true" && (
        <BlogSection title={content["home_blog_title"] || "Últimas Histórias"} />
      )}

      {/* Footer */}
      <Footer content={content} />
    </div>
  );
}
