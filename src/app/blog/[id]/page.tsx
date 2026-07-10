import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { incrementView, getSiteContent } from "@/app/admin/actions";
import TrackContentView from "@/components/TrackContentView";
import Footer from "@/components/Footer";

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, content] = await Promise.all([
    prisma.post.findUnique({
      where: { id }
    }),
    getSiteContent()
  ]);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#fbfbf8] flex flex-col justify-between">
      <div className="pt-24 pb-12 px-4 md:pt-32 md:pb-24 md:px-6">
        <TrackContentView type="post" id={id} />
        
        <article className="max-w-3xl mx-auto">
          <header className="mb-12 md:mb-16">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-950 transition-colors mb-8 md:mb-12"
            >
              <ArrowLeft className="w-3 h-3" /> Voltar ao Início
            </Link>
            
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-400 mb-4 md:mb-6 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
              <span className="opacity-20 mx-2">|</span>
              <FileText className="w-4 h-4" />
              <span>Journal Entry</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-7xl lg:text-8xl text-zinc-950 italic leading-[1.1] tracking-tight">
              {post.title}
            </h1>
          </header>

          {post.image && (
            <div className="aspect-video bg-zinc-100 rounded-3xl overflow-hidden mb-12 md:mb-16 shadow-xl shadow-zinc-200/50">
              <Image 
                src={post.image} 
                alt={post.title} 
                width={1200}
                height={675}
                className="w-full h-full object-cover grayscale-[20%]"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="prose prose-zinc prose-lg max-w-none">
            <div className="text-zinc-600 leading-relaxed space-y-6 md:space-y-8 text-base md:text-xl font-light">
              {post.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <footer className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-zinc-100">
            <div className="bg-zinc-950 rounded-3xl p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <h4 className="font-display text-2xl italic mb-2">Obrigado por ler.</h4>
                <p className="text-zinc-400 text-sm">Cada história é um fragmento de uma jornada maior.</p>
              </div>
              <Link 
                href="/gallery" 
                className="px-8 py-4 bg-white text-zinc-950 rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform"
              >
                Ver Galeria
              </Link>
            </div>
          </footer>
        </article>
      </div>
      <Footer content={content} />
    </div>
  );
}
