import { Mail, Instagram, Twitter, MapPin, Send } from "lucide-react";
import Logo from "@/components/Logo";
import { getSiteContent } from "../admin/actions";

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-zinc-600 font-sans selection:bg-zinc-900 selection:text-white pt-32 pb-24 px-6 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-20 text-center">
          <div className="inline-block mb-8">
            <Logo className="w-12 h-12 text-zinc-950 mx-auto" />
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-zinc-950 italic leading-none tracking-tighter">
            {content["contact_title_normal"] || "Vamos"} <span className="text-zinc-300">{content["contact_title_styled"] || "conversar"}</span>.
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-6 opacity-40 font-medium">
            {content["contact_subtitle"] || "Aberto a patrocínios para expedições e projetos autorais"}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-stretch">
          {/* Informações de Contato */}
          <div className="flex flex-col justify-center space-y-12">
            <div className="space-y-4">
              <h3 className="text-zinc-950 font-display text-2xl italic">
                {content["contact_info_title"] || "Informações Diretas"}
              </h3>
              <p className="text-sm opacity-60 leading-relaxed max-w-sm">
                {content["contact_info_desc"] || "Se você tem interesse em patrocinar uma expedição, adquirir obras originais ou propor um projeto fotográfico, sinta-se à vontade para entrar em contato."}
              </p>
            </div>

            <div className="space-y-8">
              <a href={`mailto:${content["contact_email"] || "contato@diogoalves.com"}`} className="flex items-center group cursor-pointer">
                <div className="p-4 bg-white border border-zinc-100 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm mr-6">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Email</p>
                  <p className="text-zinc-950 font-medium">{content["contact_email"] || "contato@diogoalves.com"}</p>
                </div>
              </a>

              <div className="flex items-center group">
                <div className="p-4 bg-white border border-zinc-100 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm mr-6">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Localização</p>
                  <p className="text-zinc-950 font-medium">São Paulo, Brasil</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100">
               <p className="text-[10px] uppercase tracking-widest mb-6 opacity-40 font-bold">Redes Sociais</p>
               <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {content["social_instagram"] && (
                    <a href={content["social_instagram"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Instagram</a>
                  )}
                  {content["social_twitter"] && (
                    <a href={content["social_twitter"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Twitter</a>
                  )}
                  {content["social_facebook"] && (
                    <a href={content["social_facebook"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Facebook</a>
                  )}
                  {content["social_behance"] && (
                    <a href={content["social_behance"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Behance</a>
                  )}
                  {content["social_flickr"] && (
                    <a href={content["social_flickr"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Flickr</a>
                  )}
                  {content["social_500px"] && (
                    <a href={content["social_500px"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">500px</a>
                  )}
                  {content["social_linkedin"] && (
                    <a href={content["social_linkedin"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">LinkedIn</a>
                  )}
                  {content["social_pinterest"] && (
                    <a href={content["social_pinterest"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Pinterest</a>
                  )}
                  {content["social_unsplash"] && (
                    <a href={content["social_unsplash"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Unsplash</a>
                  )}
                  {content["social_vero"] && (
                    <a href={content["social_vero"]} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-zinc-950 font-bold hover:underline underline-offset-8 decoration-1">Vero</a>
                  )}
               </div>
            </div>
          </div>

          {/* Formulário Simples */}
          <div className="bg-white border border-zinc-100 p-8 md:p-12 shadow-sm">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-zinc-50 border-b border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@exemplo.com"
                    className="w-full bg-zinc-50 border-b border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Mensagem</label>
                <textarea 
                  rows={6}
                  placeholder="Como posso ajudar?"
                  className="w-full bg-zinc-50 border-b border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-zinc-950 text-white text-[10px] uppercase tracking-[0.3em] py-5 hover:bg-zinc-800 transition-colors font-bold flex items-center justify-center group"
              >
                Enviar Mensagem <Send size={14} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
