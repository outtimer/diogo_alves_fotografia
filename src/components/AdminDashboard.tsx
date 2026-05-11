"use client";

import { useState } from "react";
import { Trash2, Plus, ImageIcon, FileText, MapPin, Tag, Calendar, AlignLeft, Home, User, Mail, Save } from "lucide-react";
import { addPhoto, deletePhoto, addPost, deletePost, updateSiteContent } from "@/app/admin/actions";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
  category: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: Date;
  content: string;
  image: string | null;
}

interface AdminDashboardProps {
  initialPhotos: Photo[];
  initialPosts: Post[];
  initialContent: Record<string, string>;
}

export default function AdminDashboard({ initialPhotos, initialPosts, initialContent }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("photos");

  const renderContentForm = (section: string, fields: { label: string, key: string, type: "text" | "textarea" | "url" }[]) => (
    <div className="bg-white border border-zinc-100 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 flex items-center">
        <Save size={14} className="mr-2" /> Editar Seção: {section}
      </h2>
      <form action={updateSiteContent} className="space-y-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea 
                name={field.key} 
                defaultValue={initialContent[field.key] || ""}
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors resize-none"
              />
            ) : (
              <input 
                name={field.key} 
                type={field.type}
                defaultValue={initialContent[field.key] || ""}
                className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors"
              />
            )}
          </div>
        ))}
        <button type="submit" className="w-full bg-zinc-950 text-white text-[10px] uppercase tracking-[0.2em] py-4 hover:bg-zinc-800 transition-colors font-bold flex items-center justify-center">
          <Save size={14} className="mr-2" /> Salvar Alterações
        </button>
      </form>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-4 border-b border-zinc-200 mb-12">
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "photos" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <ImageIcon size={14} className="mr-2" /> Galeria
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "posts" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <FileText size={14} className="mr-2" /> Blog
        </button>
        <button
          onClick={() => setActiveTab("home")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "home" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Home size={14} className="mr-2" /> Home
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "about" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <User size={14} className="mr-2" /> Sobre
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "contact" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Mail size={14} className="mr-2" /> Contato
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center transition-all ${
            activeTab === "footer" ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <MapPin size={14} className="mr-2" /> Rodapé & Social
        </button>
      </div>

      {activeTab === "photos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Photo Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-100 p-8 shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 flex items-center">
                <Plus size={14} className="mr-2" /> Nova Foto
              </h2>
              <form action={addPhoto} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">URL da Imagem</label>
                  <input name="url" type="url" required placeholder="https://images.unsplash.com/..." className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Título</label>
                  <input name="title" type="text" required className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Localização</label>
                    <input name="location" type="text" className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Categoria</label>
                    <select name="category" required className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors">
                      <option value="Landscape">Paisagem</option>
                      <option value="Urban">Urbano</option>
                      <option value="Wildlife">Vida Selvagem</option>
                      <option value="Daily">Cotidiano</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-zinc-950 text-white text-[10px] uppercase tracking-[0.2em] py-4 hover:bg-zinc-800 transition-colors font-bold">
                  Salvar Foto
                </button>
              </form>
            </div>
          </div>

          {/* Photo List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden text-zinc-950">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Preview</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Info</th>
                    <th className="p-4 text-right text-[10px] uppercase tracking-widest font-bold opacity-40">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {initialPhotos.length === 0 ? (
                    <tr><td colSpan={3} className="p-12 text-center text-sm opacity-40">Nenhuma foto cadastrada.</td></tr>
                  ) : (
                    initialPhotos.map((photo) => (
                      <tr key={photo.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="p-4 w-24">
                          <div className="aspect-[3/4] bg-zinc-100 border border-zinc-200 overflow-hidden relative">
                            <img src={photo.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="p-4">
                          <h3 className="text-sm font-medium mb-1">{photo.title}</h3>
                          <div className="flex items-center space-x-3 text-[10px] text-zinc-400">
                            <span className="flex items-center"><MapPin size={10} className="mr-1" /> {photo.location || "Sem local"}</span>
                            <span className="flex items-center uppercase tracking-tighter"><Tag size={10} className="mr-1" /> {photo.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={async () => {
                              if (confirm("Tem certeza que deseja deletar esta foto?")) {
                                await deletePhoto(photo.id);
                              }
                            }}
                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Post Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-100 p-8 shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 flex items-center">
                <Plus size={14} className="mr-2" /> Novo Post
              </h2>
              <form action={addPost} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Título</label>
                  <input name="title" type="text" required className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Resumo (Excerpt)</label>
                  <textarea name="excerpt" rows={2} required className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">URL da Imagem de Capa</label>
                  <input name="image" type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">Conteúdo</label>
                  <textarea name="content" rows={6} required className="w-full bg-zinc-50 border border-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full bg-zinc-950 text-white text-[10px] uppercase tracking-[0.2em] py-4 hover:bg-zinc-800 transition-colors font-bold">
                  Publicar Post
                </button>
              </form>
            </div>
          </div>

          {/* Post List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden text-zinc-950">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Capa</th>
                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Título & Data</th>
                    <th className="p-4 text-right text-[10px] uppercase tracking-widest font-bold opacity-40">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {initialPosts.length === 0 ? (
                    <tr><td colSpan={3} className="p-12 text-center text-sm opacity-40">Nenhum post encontrado.</td></tr>
                  ) : (
                    initialPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="p-4 w-32">
                          <div className="aspect-video bg-zinc-100 border border-zinc-200 overflow-hidden relative">
                            {post.image ? (
                              <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[8px] text-zinc-300">Sem imagem</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <h3 className="text-sm font-medium mb-1 line-clamp-1">{post.title}</h3>
                          <div className="flex items-center space-x-3 text-[10px] text-zinc-400">
                            <span className="flex items-center"><Calendar size={10} className="mr-1" /> {new Date(post.date).toLocaleDateString('pt-BR')}</span>
                            <span className="flex items-center"><AlignLeft size={10} className="mr-1" /> {post.content.length} caracteres</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={async () => {
                              if (confirm("Tem certeza que deseja deletar este post?")) {
                                await deletePost(post.id);
                              }
                            }}
                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "home" && renderContentForm("Página Inicial", [
        { label: "Título Hero (Primeira Parte)", key: "home_hero_title_1", type: "text" },
        { label: "Título Hero (Parte Estilizada)", key: "home_hero_title_2", type: "text" },
        { label: "Subtítulo Hero", key: "home_hero_subtitle", type: "text" },
        { label: "Texto Principal Hero", key: "home_hero_main_text", type: "textarea" },
        { label: "URL da Imagem de Fundo Hero", key: "home_hero_bg_url", type: "url" },
        { label: "Título da Seção de Galeria", key: "home_gallery_title", type: "text" },
        { label: "Título da Seção de Blog", key: "home_blog_title", type: "text" },
        { label: "Título do Rodapé (CTA)", key: "footer_cta_title", type: "text" },
        { label: "Descrição do Rodapé (CTA)", key: "footer_cta_desc", type: "textarea" },
      ])}

      {activeTab === "about" && renderContentForm("Sobre Mim", [
        { label: "Saudação (Overlay)", key: "about_greeting", type: "text" },
        { label: "Título Principal", key: "about_title_normal", type: "text" },
        { label: "Título Principal (Estilizado)", key: "about_title_styled", type: "text" },
        { label: "Biografia", key: "about_bio", type: "textarea" },
        { label: "Anos de Experiência", key: "about_years", type: "text" },
        { label: "Equipamento", key: "about_equipment", type: "text" },
        { label: "Residência/Localização", key: "about_address", type: "text" },
        { label: "Link da Trajetória (Texto)", key: "about_link_text", type: "text" },
        { label: "URL da Foto de Perfil", key: "about_photo_url", type: "url" },
      ])}

      {activeTab === "contact" && renderContentForm("Contato", [
        { label: "Título da Página", key: "contact_title_normal", type: "text" },
        { label: "Título da Página (Estilizado)", key: "contact_title_styled", type: "text" },
        { label: "Subtítulo", key: "contact_subtitle", type: "text" },
        { label: "Título de Info", key: "contact_info_title", type: "text" },
        { label: "Descrição de Info", key: "contact_info_desc", type: "textarea" },
        { label: "E-mail de Contato", key: "contact_email", type: "text" },
      ])}

      {activeTab === "footer" && renderContentForm("Rodapé & Redes Sociais", [
        { label: "Instagram URL", key: "social_instagram", type: "url" },
        { label: "Twitter/X URL", key: "social_twitter", type: "url" },
        { label: "LinkedIn URL", key: "social_linkedin", type: "url" },
        { label: "Copyright Texto", key: "footer_copyright", type: "text" },
        { label: "Tagline do Rodapé", key: "footer_tagline", type: "text" },
      ])}
    </div>
  );
}
