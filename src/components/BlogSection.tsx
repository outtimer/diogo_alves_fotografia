import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

interface BlogSectionProps {
  title?: string;
}

export default async function BlogSection({ title }: BlogSectionProps) {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 3
    });
  } catch (error) {
    console.warn("Post table missing or DB not initialized:", error);
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-white" id="blog">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 block">Field Notes</span>
          <h2 className="font-display text-4xl md:text-5xl text-zinc-950 italic">{title || "Experiências, locais & histórias sob a lente."}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="aspect-[16/10] overflow-hidden bg-zinc-100 mb-6 relative">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-400 mb-4">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="font-display text-2xl text-zinc-950 mb-3 group-hover:text-zinc-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6 line-clamp-2">
                {post.excerpt}
              </p>
              <Link 
                href={`/blog/${post.id}`}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-950 hover:gap-3 transition-all"
              >
                Ler mais <ArrowRight className="w-3 h-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
