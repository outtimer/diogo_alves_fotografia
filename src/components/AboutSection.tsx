import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutSectionProps {
  content: Record<string, string>;
}

export default function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="py-24 px-6 bg-white border-b border-zinc-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
          {/* Smaller, more intimate photo */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 overflow-hidden rounded-full grayscale hover:grayscale-0 transition-all duration-1000 group">
            <Image
              src={content["about_photo_url"] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"}
              alt="Diogo Alves"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Personal Text Side */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 block">
              {content["about_greeting"] || "Olá, eu sou o Diogo"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-zinc-950 italic mb-6 leading-tight">
              {content["about_title_normal"] || "Um curioso por natureza,"} <span className="text-zinc-400 font-normal">{content["about_title_styled"] || "apaixonado por café"}</span> e silêncios produtivos.
            </h2>
            <div className="text-sm text-zinc-500 mb-8 max-w-xl leading-relaxed mx-auto md:mx-0">
              <p>
                {content["about_bio"] || "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar."}
              </p>
            </div>
            <Link 
              href="/about"
              className="inline-flex items-center gap-3 group text-zinc-950 self-center md:self-start"
            >
              <span className="text-[10px] uppercase tracking-widest font-black border-b border-zinc-200 pb-1 group-hover:border-zinc-950 transition-colors">
                {content["about_link_text"] || "Conheça minha trajetória profissional"}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
