import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { incrementView } from "@/app/admin/actions";
import TrackContentView from "@/components/TrackContentView";

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#fbfbf8] pt-32 pb-24 px-6">
      <TrackContentView type="post" id={id} />
      
      <article className="max-w-3xl mx-auto">
        <header className="mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-950 transition-colors mb-12"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar ao Início
          </Link>
          
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-400 mb-6 font-bold">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
            <span className="opacity-20 mx-2">|</span>
            <FileText className="w-4 h-4" />
            <span>Journal Entry</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-7xl lg:text-8xl text-zinc-950 italic leading-[1.1] tracking-tight">
            {post.title}
          </h1>
        </header>

        {post.image && (
          <div className="aspect-video bg-zinc-100 rounded-3xl overflow-hidden mb-16 shadow-xl shadow-zinc-200/50">
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
          <div className="text-zinc-600 leading-relaxed space-y-8 text-lg md:text-xl font-light">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <footer className="mt-16 pt-10 border-t border-zinc-100">
          <div className="bg-zinc-950 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8">
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
  );
}
