import { Camera, MapPin, Award } from "lucide-react";
import Logo from "@/components/Logo";
import { getSiteContent } from "../admin/actions";

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20">
          <div className="inline-block mb-8">
            <Logo className="w-12 h-12 text-zinc-950" />
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-zinc-950 italic leading-none tracking-tighter">
            Sobre <span className="text-zinc-300">{content["about_title_styled"] || "Diogo Alves"}</span>.
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-6 opacity-40 font-medium">História e Visão</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="relative group">
             <div className="aspect-[3/4] bg-zinc-100 overflow-hidden border border-zinc-100 shadow-2xl">
                <img 
                  src={content["about_photo_url"] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000"} 
                  alt="Diogo Alves" 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
                />
             </div>
             <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-8 border border-zinc-100 shadow-lg hidden md:block">
                <p className="font-display text-4xl text-zinc-950 italic">{content["about_years"] || "10+"}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-40">Anos de Luz</p>
             </div>
          </div>

          <div className="space-y-10 pt-4">
            <div className="space-y-6">
              <h3 className="text-zinc-950 font-display text-3xl italic">
                {content["about_title_normal"] || "A busca pelo invisível."}
              </h3>
              <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">
                {content["about_bio"] || "Minha jornada na fotografia começou nas ruas de São Paulo, capturando a geometria brutalista e a humanidade vibrante da metrópole. Com o tempo, meu olhar se voltou para o silêncio — das paisagens remotas da Islândia à paciência necessária para observar a vida selvagem no Quênia. \n\nAcredito que uma boa fotografia não apenas documenta um momento, mas traduz o sentimento que ele evoca. Meu trabalho é minimalista por escolha, focado na pureza da colagem e na honestidade da luz."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
              <div className="space-y-4">
                <div className="flex items-center text-zinc-950 space-x-3">
                  <Camera size={18} className="opacity-30" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Equipamento</span>
                </div>
                <p className="text-[11px] opacity-60 leading-relaxed whitespace-pre-wrap">
                  {content["about_equipment"] || "Leica M11 & Sony A7R V\n35mm Fixed Lens focus"}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-zinc-950 space-x-3">
                  <MapPin size={18} className="opacity-30" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Residência</span>
                </div>
                <p className="text-[11px] opacity-60 leading-relaxed whitespace-pre-wrap">
                  {content["about_address"] || "São Paulo, Brasil\nDisponível para projetos globais"}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-8 space-y-4">
              <div className="flex items-center text-zinc-950 space-x-3">
                <Award size={18} className="opacity-30" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Reconhecimento</span>
              </div>
              <ul className="text-[11px] space-y-2 opacity-60">
                <li>• National Geographic Photo of the Year (Finalist 2021)</li>
                <li>• International Photography Awards (Gold - Nature 2022)</li>
                <li>• Exhibition "Urban Silence" - Tokyo, Japan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
