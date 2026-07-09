import { Camera, MapPin, Award } from "lucide-react";
import Logo from "@/components/Logo";
import { getSiteContent } from "../admin/actions";
import Image from "next/image";

export default async function AboutPage() {
  const content = await getSiteContent();

  let rawTitle = content["about_page_title"] || `Sobre ${content["about_title_styled"] || "Diogo Alves"}`;
  let processedTitle = rawTitle.replace(/^sobre\s+/i, "").trim();
  if (processedTitle.endsWith(".")) {
    processedTitle = processedTitle.slice(0, -1);
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6 lg:pt-48 lg:pb-32 3xl:pt-64 3xl:pb-48">
      <div className="max-w-5xl 2xl:max-w-7xl 3xl:max-w-[1800px] mx-auto">
        <header className="mb-20 3xl:mb-32">
          <div className="inline-block mb-8 3xl:mb-16">
            <Logo className="w-12 h-12 lg:w-16 lg:h-16 3xl:w-24 3xl:h-24 text-zinc-950" />
          </div>
          <h1 className="font-display text-5xl md:text-8xl lg:text-9xl 3xl:text-[12rem] text-zinc-300 italic leading-none tracking-tighter text-balance">
            {processedTitle}<span className="text-zinc-950">.</span>
          </h1>
          <p className="text-[10px] 3xl:text-base uppercase tracking-[0.4em] mt-6 3xl:mt-12 opacity-40 font-medium">História e Visão</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 3xl:gap-32 items-start">
          <div className="relative group">
             <div className="aspect-[3/4] bg-zinc-100 overflow-hidden border border-zinc-100 shadow-2xl relative">
                <Image 
                  src={content["about_page_photo_url"] || content["about_photo_url"] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000"} 
                  alt="Diogo Alves" 
                  fill
                  className="object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
             </div>
             <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-8 3xl:p-12 border border-zinc-100 shadow-lg hidden md:block">
                <p className="font-display text-4xl 3xl:text-7xl text-zinc-950 italic">{content["about_page_years"] || content["about_years"] || "10+"}</p>
                <p className="text-[9px] 3xl:text-xs uppercase tracking-widest opacity-40">Anos de Luz</p>
             </div>
          </div>

          <div className="space-y-10 3xl:space-y-20 pt-4">
            <div className="space-y-6 3xl:space-y-12">
              <h3 className="text-zinc-950 font-display text-3xl md:text-5xl 3xl:text-7xl italic text-balance">
                {content["about_page_subtitle"] || content["about_title_normal"] || "A busca pelo invisível."}
              </h3>
              <p className="text-sm lg:text-base 3xl:text-2xl leading-relaxed opacity-80 whitespace-pre-wrap text-pretty">
                {content["about_page_bio"] || content["about_bio"] || "Minha jornada na fotografia começou nas ruas de São Paulo, capturando a geometria brutalista e a humanidade vibrante da metrópole. Com o tempo, meu olhar se voltou para o silêncio — das paisagens remotas da Islândia à paciência necessária para observar a vida selvagem no Quênia. \n\nAcredito que uma boa fotografia não apenas documenta um momento, mas traduz o sentimento que ele evoca. Meu trabalho é minimalista por escolha, focado na pureza da colagem e na honestidade da luz."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 3xl:gap-16 pt-8 3xl:pt-16 border-t border-zinc-100">
              <div className="space-y-4">
                <div className="flex items-center text-zinc-950 space-x-3">
                  <Camera size={18} className="opacity-30 3xl:w-6 3xl:h-6" />
                  <span className="text-[10px] 3xl:text-sm uppercase tracking-widest font-bold">Equipamento</span>
                </div>
                <p className="text-[11px] 3xl:text-lg opacity-60 leading-relaxed whitespace-pre-wrap">
                  {content["about_page_equipment"] || content["about_equipment"] || "Leica M11 & Sony A7R V\n35mm Fixed Lens focus"}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-zinc-950 space-x-3">
                  <MapPin size={18} className="opacity-30 3xl:w-6 3xl:h-6" />
                  <span className="text-[10px] 3xl:text-sm uppercase tracking-widest font-bold">Residência</span>
                </div>
                <p className="text-[11px] 3xl:text-lg opacity-60 leading-relaxed whitespace-pre-wrap">
                  {content["about_page_address"] || content["about_address"] || "São Paulo, Brasil\nDisponível para projetos globais"}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-8 3xl:p-16 space-y-4 3xl:space-y-8">
              <div className="flex items-center text-zinc-950 space-x-3">
                <Award size={18} className="opacity-30 3xl:w-6 3xl:h-6" />
                <span className="text-[10px] 3xl:text-sm uppercase tracking-widest font-bold">Reconhecimento</span>
              </div>
              <ul className="text-[11px] 3xl:text-lg space-y-2 opacity-60">
                {(content["about_page_awards"] || "• National Geographic Photo of the Year (Finalist 2021)\n• International Photography Awards (Gold - Nature 2022)\n• Exhibition \"Urban Silence\" - Tokyo, Japan")
                  .split("\n")
                  .filter((line) => line.trim().length > 0)
                  .map((line, i) => (
                    <li key={i}>{line.trim().startsWith("•") || line.trim().startsWith("-") ? line : `• ${line}`}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
