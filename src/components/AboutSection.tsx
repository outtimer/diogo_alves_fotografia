import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutSectionProps {
  content: Record<string, string>;
}

export default function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="py-24 px-6 bg-white border-b border-zinc-100 lg:py-32 xl:py-48 3xl:py-64">
      <div className="max-w-5xl 2xl:max-w-7xl 3xl:max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 3xl:gap-32 items-center text-center md:text-left">
          {/* Smaller, more intimate photo */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 3xl:w-[500px] 3xl:h-[500px] flex-shrink-0 overflow-hidden rounded-full grayscale hover:grayscale-0 transition-all duration-1000 group">
            <Image
              src={content["about_home_photo_url"] || content["about_photo_url"] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"}
              alt="Diogo Alves"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Personal Text Side */}
          <div className="flex flex-col">
            <span className="text-[10px] 3xl:text-xs uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 block">
              {content["about_home_greeting"] || content["about_greeting"] || "Olá, eu sou o Diogo"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl 3xl:text-8xl text-zinc-950 italic mb-6 leading-tight text-balance">
              {content["about_home_title_normal"] || content["about_title_normal"] || "Um curioso por natureza,"} <span className="text-zinc-400 font-normal">{content["about_home_title_styled"] || content["about_title_styled"] || "apaixonado por café"}</span> e silêncios produtivos.
            </h2>
            <div className="text-sm lg:text-base 3xl:text-xl text-zinc-500 mb-8 max-w-xl lg:max-w-2xl 3xl:max-w-4xl leading-relaxed mx-auto md:mx-0 text-pretty">
              <p>
                {content["about_home_bio"] || content["about_bio"] || "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar."}
              </p>
            </div>
            <Link 
              href="/about"
              className="inline-flex items-center gap-3 group text-zinc-950 self-center md:self-start"
            >
              <span className="text-[10px] uppercase tracking-widest font-black border-b border-zinc-200 pb-1 group-hover:border-zinc-950 transition-colors">
                {content["about_home_link_text"] || content["about_link_text"] || "Conheça minha trajetória profissional"}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
