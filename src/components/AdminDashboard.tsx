"use client";

import { useState } from "react";
import { addPhoto, deletePhoto, addPost, deletePost, updateSiteContent, uploadImage, addUser, deleteUser } from "@/app/admin/actions";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, Plus, ImageIcon, FileText, MapPin, Tag, Calendar, AlignLeft, Home, User, Mail, Save, LayoutDashboard, Settings, TrendingUp, Eye, ArrowUpRight, Upload, Loader2, Link as LinkIcon, Users, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
  category: string;
  views: number;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: Date;
  content: string;
  image: string | null;
  views: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface AnalyticsData {
  date: Date;
  visits: number;
}

interface AdminDashboardProps {
  initialPhotos: Photo[];
  initialPosts: Post[];
  initialContent: Record<string, string>;
  analytics: AnalyticsData[];
  topPhotos: Photo[];
  topPosts: Post[];
  users: UserData[];
  currentUser: { id: string, name: string, email: string, role: string };
}

export default function AdminDashboard({ 
  initialPhotos, 
  initialPosts, 
  initialContent,
  analytics = [],
  topPhotos = [],
  topPosts = [],
  users = [],
  currentUser
}: AdminDashboardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const isAdmin = currentUser.role === "ADMIN";

  const tabs = [
    { id: "dashboard", label: "Métricas", icon: LayoutDashboard },
    { id: "photos", label: "Galeria", icon: ImageIcon },
    { id: "posts", label: "Blog", icon: FileText },
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "Sobre", icon: User },
    { id: "contact", label: "Contato", icon: Mail },
    { id: "footer", label: "Rodapé", icon: Settings },
    ...(isAdmin ? [{ id: "users", label: "Usuários", icon: Users }] : []),
  ];

  // Format analytics for charts
  const chartData = analytics.map(item => ({
    name: new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    visitas: item.visits
  }));

  // Calculate some simple metrics
  const totalVisits = analytics.reduce((sum, item) => sum + item.visits, 0);
  const avgVisits = analytics.length > 0 ? Math.round(totalVisits / analytics.length) : 0;
  const totalPhotoViews = initialPhotos.reduce((sum, p) => sum + p.views, 0);
  const totalPostViews = initialPosts.reduce((sum, p) => sum + p.views, 0);

  const renderContentForm = (section: string, fields: { label: string, key: string, type: "text" | "textarea" | "url" }[]) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-xl font-display italic text-zinc-950 mb-2">Editar Seção</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">{section}</p>
        </div>
        <div className="bg-zinc-50 p-3 rounded-2xl">
          <Save size={20} className="text-zinc-400" />
        </div>
      </div>

      <form action={updateSiteContent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3 ml-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea 
                name={field.key} 
                defaultValue={initialContent[field.key] || ""}
                rows={5}
                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300"
              />
            ) : (
              <input 
                name={field.key} 
                type={field.type}
                defaultValue={initialContent[field.key] || ""}
                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300"
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2 pt-4">
          <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all font-bold flex items-center justify-center group">
            <Save size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Salvar Alterações</span>
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Dashboard Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Sistema Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display italic text-zinc-950">Painel Criativo</h1>
          <p className="text-sm text-zinc-400 mt-2">Gerencie sua arte, histórias e presença digital.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-950 leading-none">{initialPhotos.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Fotos</p>
            </div>
          </div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-950 leading-none">{initialPosts.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Container */}
      <div className="bg-zinc-100/50 p-2 rounded-3xl mb-16 inline-flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold flex items-center transition-all duration-300 ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-950 hover:bg-white"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-zinc-950 rounded-2xl z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                <Icon size={14} className={`mr-2 ${isActive ? "text-white" : "text-zinc-400"}`} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <Eye size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Total Views</span>
                </div>
                <h4 className="text-3xl font-display italic text-zinc-950">{totalPhotoViews + totalPostViews}</h4>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wider">Acúmulo total do portfólio</p>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Visitas 30d</span>
                </div>
                <h4 className="text-3xl font-display italic text-zinc-950">{totalVisits}</h4>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wider">Média de {avgVisits}/dia</p>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Top Photo</span>
                </div>
                <h4 className="text-sm font-medium text-zinc-950 truncate max-w-[150px]">
                  {topPhotos[0]?.title || "Nenhuma"}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wider">{topPhotos[0]?.views || 0} visualizações</p>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Top Post</span>
                </div>
                <h4 className="text-sm font-medium text-zinc-950 truncate max-w-[150px]">
                  {topPosts[0]?.title || "Nenhum"}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-wider">{topPosts[0]?.views || 0} visualizações</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-display italic text-zinc-950">Tráfego do Site</h3>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Últimos 30 dias</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: "#a1a1aa" }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: "16px", 
                          border: "none", 
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                          fontWeight: "600"
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitas" 
                        stroke="#000" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorVisits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Content List */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
                <h3 className="text-xl font-display italic text-zinc-950 mb-2">Conteúdo em Alta</h3>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-8">Baseado em cliques</p>
                
                <div className="space-y-6">
                  {topPhotos.slice(1, 4).map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                        <img src={item.url} alt="" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-zinc-950 truncate">{item.title}</h5>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Foto • {item.views} views</p>
                      </div>
                      <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                    </div>
                  ))}

                  <div className="h-[1px] bg-zinc-50 w-full my-4" />

                  {topPosts.slice(1, 3).map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                           <img src={item.image} alt="" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                        ) : (
                          <FileText size={16} className="text-zinc-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-zinc-950 truncate">{item.title}</h5>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Post • {item.views} views</p>
                      </div>
                      <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveTab("photos")}
                  className="w-full mt-10 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-[10px] uppercase tracking-widest font-bold text-zinc-600 transition-colors"
                >
                  Ver toda a galeria
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <button 
                onClick={() => setActiveTab("photos")}
                className="flex items-center gap-4 p-6 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-950/20 transition-all text-left"
               >
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                   <Plus size={20} />
                 </div>
                 <div>
                   <h6 className="text-xs font-bold text-zinc-950 uppercase tracking-widest">Nova Obra</h6>
                   <p className="text-[10px] text-zinc-400">Adicionar foto à coleção</p>
                 </div>
               </button>

               <button 
                onClick={() => setActiveTab("posts")}
                className="flex items-center gap-4 p-6 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-950/20 transition-all text-left"
               >
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                   <FileText size={20} />
                 </div>
                 <div>
                   <h6 className="text-xs font-bold text-zinc-950 uppercase tracking-widest">Nova História</h6>
                   <p className="text-[10px] text-zinc-400">Publicar no blog</p>
                 </div>
               </button>

               <button 
                onClick={() => setActiveTab("footer")}
                className="flex items-center gap-4 p-6 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-950/20 transition-all text-left"
               >
                 <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                   <Settings size={20} />
                 </div>
                 <div>
                   <h6 className="text-xs font-bold text-zinc-950 uppercase tracking-widest">Ajustes Gerais</h6>
                   <p className="text-[10px] text-zinc-400">Configurações globais</p>
                 </div>
               </button>
            </div>
          </motion.div>
        )}

        {activeTab === "photos" && (
          <motion.div 
            key="photos"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Photo Form */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 sticky top-32">
                <h2 className="text-lg font-display italic mb-8 flex items-center text-zinc-950">
                  <Plus size={20} className="mr-3 text-zinc-400" /> Nova Obra
                </h2>
                <form action={addPhoto} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Imagem</label>
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setIsUploading(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const result = await uploadImage(formData);
                              // Update the URL input
                              const urlInput = document.querySelector('input[name="url"]') as HTMLInputElement;
                              if (urlInput) urlInput.value = result.url;
                            } catch (error) {
                              alert("Erro no upload. Verifique suas chaves do Cloudinary.");
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                          {isUploading ? (
                            <Loader2 size={24} className="text-zinc-400 animate-spin" />
                          ) : (
                            <Upload size={24} className="text-zinc-300" />
                          )}
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                            {isUploading ? "Enviando..." : "Arraste ou clique para upload"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300">
                          <LinkIcon size={14} />
                        </div>
                        <input name="url" type="url" required placeholder="https://cloudinary.com/..." className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título</label>
                    <input name="title" type="text" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Local</label>
                      <input name="location" type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Categoria</label>
                      <select name="category" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all appearance-none">
                        <option value="Landscape">Paisagem</option>
                        <option value="Urban">Urbano</option>
                        <option value="Wildlife">Vida Selvagem</option>
                        <option value="Daily">Cotidiano</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center">
                    <Save size={16} className="mr-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Adicionar à Galeria</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Photo List */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Obras Recentes</span>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50">
                      {initialPhotos.length === 0 ? (
                        <tr><td className="p-20 text-center text-sm text-zinc-400 italic">O deserto está vazio por aqui... comece a criar.</td></tr>
                      ) : (
                        initialPhotos.map((photo) => (
                          <tr key={photo.id} className="hover:bg-zinc-50/30 transition-colors group">
                            <td className="p-6 w-32">
                              <div className="aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden relative shadow-md group-hover:scale-[1.05] transition-transform duration-500">
                                <img src={photo.url} alt="" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                              </div>
                            </td>
                            <td className="p-6">
                              <h3 className="text-base font-display italic text-zinc-950 mb-2">{photo.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
                                <span className="flex items-center px-2 py-1 bg-zinc-100 rounded-lg text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                  <MapPin size={10} className="mr-2" /> {photo.location || "Coordenadas OCULTAS"}
                                </span>
                                <span className="flex items-center px-2 py-1 bg-zinc-100 rounded-lg text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                  <Tag size={10} className="mr-2" /> {photo.category}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 text-right">
                              <button 
                                onClick={async () => {
                                  if (confirm("Tem certeza que deseja apagar esta obra?")) {
                                    await deletePhoto(photo.id);
                                  }
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 size={18} />
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
          </motion.div>
        )}

        {activeTab === "posts" && (
          <motion.div 
            key="posts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Post Form */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 sticky top-32">
                <h2 className="text-lg font-display italic mb-8 flex items-center text-zinc-950">
                  <Plus size={20} className="mr-3 text-zinc-400" /> Nova História
                </h2>
                <form action={addPost} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título</label>
                    <input name="title" type="text" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Resumo (Pílula)</label>
                    <textarea name="excerpt" rows={2} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Imagem de Capa</label>
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setIsUploading(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const result = await uploadImage(formData);
                              const urlInput = document.querySelector('input[name="image"]') as HTMLInputElement;
                              if (urlInput) urlInput.value = result.url;
                            } catch (error) {
                              alert("Erro no upload.");
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                          {isUploading ? (
                            <Loader2 size={20} className="text-zinc-400 animate-spin" />
                          ) : (
                            <Upload size={20} className="text-zinc-300" />
                          )}
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Upload Cloudinary</p>
                        </div>
                      </div>
                      <input name="image" type="url" placeholder="URL da Capa" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Conteúdo Narrativo</label>
                    <textarea name="content" rows={5} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center">
                    <Plus size={16} className="mr-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Publicar História</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Post List */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Blog Cronológico</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50">
                      {initialPosts.length === 0 ? (
                        <tr><td className="p-20 text-center text-sm text-zinc-400 italic">Silêncio no blog... escreva algo memorável.</td></tr>
                      ) : (
                        initialPosts.map((post) => (
                          <tr key={post.id} className="hover:bg-zinc-50/30 transition-colors group">
                            <td className="p-6 w-40">
                              <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden relative shadow-md">
                                {post.image ? (
                                  <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-zinc-300">Null</div>
                                )}
                              </div>
                            </td>
                            <td className="p-6">
                              <h3 className="text-base font-display italic text-zinc-950 mb-2 line-clamp-1">{post.title}</h3>
                              <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                                <span className="flex items-center"><Calendar size={12} className="mr-2" /> {new Date(post.date).toLocaleDateString('pt-BR')}</span>
                                <span className="flex items-center font-black text-zinc-200">|</span>
                                <span className="flex items-center"><AlignLeft size={12} className="mr-2" /> {post.content.length} Caracteres</span>
                              </div>
                            </td>
                            <td className="p-6 text-right">
                              <button 
                                onClick={async () => {
                                  if (confirm("Deseja apagar permanentemente esta história?")) {
                                    await deletePost(post.id);
                                  }
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 size={18} />
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
          </motion.div>
        )}

        {activeTab === "home" && renderContentForm("Página Inicial", [
          { label: "Título Hero (Parte 1)", key: "home_hero_title_1", type: "text" },
          { label: "Título Hero (Estilizado)", key: "home_hero_title_2", type: "text" },
          { label: "Subtítulo Hero", key: "home_hero_subtitle", type: "text" },
          { label: "Texto Narrativo Hero", key: "home_hero_main_text", type: "textarea" },
          { label: "URL Fundo Atmosférico", key: "home_hero_bg_url", type: "url" },
          { label: "Título Curadoria", key: "home_gallery_title", type: "text" },
          { label: "Título Crônicas", key: "home_blog_title", type: "text" },
        ])}

        {activeTab === "about" && renderContentForm("Sobre Mim", [
          { label: "Saudação Atmosférica", key: "about_greeting", type: "text" },
          { label: "Título Identidade", key: "about_title_normal", type: "text" },
          { label: "Título Estilizado", key: "about_title_styled", type: "text" },
          { label: "Manifesto / Bio", key: "about_bio", type: "textarea" },
          { label: "Tempo de Luz (Anos)", key: "about_years", type: "text" },
          { label: "Armas de Criação (Equipamento)", key: "about_equipment", type: "text" },
          { label: "Base de Operações (Localização)", key: "about_address", type: "text" },
          { label: "CTA Trajetória", key: "about_link_text", type: "text" },
          { label: "Retrato (URL)", key: "about_photo_url", type: "url" },
        ])}

        {activeTab === "contact" && renderContentForm("Contato", [
          { label: "Título Chamada", key: "contact_title_normal", type: "text" },
          { label: "Título Estilizado", key: "contact_title_styled", type: "text" },
          { label: "Subtítulo Engajamento", key: "contact_subtitle", type: "text" },
          { label: "Card Título", key: "contact_info_title", type: "text" },
          { label: "Card Narrativa", key: "contact_info_desc", type: "textarea" },
          { label: "E-mail Oficial", key: "contact_email", type: "text" },
        ])}

        {activeTab === "footer" && renderContentForm("Rodapé & Conexões", [
          { label: "Título CTA Footer", key: "footer_cta_title", type: "text" },
          { label: "Descrição CTA Footer", key: "footer_cta_desc", type: "textarea" },
          { label: "Assinatura Copyright", key: "footer_copyright", type: "text" },
          { label: "Tagline Geográfica", key: "footer_tagline", type: "text" },
          { label: "Instagram Link", key: "social_instagram", type: "url" },
          { label: "Twitter / X Link", key: "social_twitter", type: "url" },
          { label: "Facebook Link", key: "social_facebook", type: "url" },
          { label: "Behance Link", key: "social_behance", type: "url" },
          { label: "Flickr Link", key: "social_flickr", type: "url" },
          { label: "500px Link", key: "social_500px", type: "url" },
          { label: "LinkedIn Link", key: "social_linkedin", type: "url" },
          { label: "Pinterest Link", key: "social_pinterest", type: "url" },
          { label: "Vero Link", key: "social_vero", type: "url" },
          { label: "Unsplash Link", key: "social_unsplash", type: "url" },
        ])}

        {activeTab === "users" && isAdmin && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* User Form */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 sticky top-32">
                <h2 className="text-lg font-display italic mb-8 flex items-center text-zinc-950">
                  <User size={20} className="mr-3 text-zinc-400" /> Novo Usuário
                </h2>
                <form action={addUser} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Nome Completo</label>
                    <input name="name" type="text" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">E-mail</label>
                    <input name="email" type="email" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Senha</label>
                    <input name="password" type="password" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Cargo / Nível</label>
                    <select name="role" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all appearance-none">
                      <option value="EDITOR">Editor (Conteúdo)</option>
                      <option value="ADMIN">Administrador (Total)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center">
                    <Plus size={16} className="mr-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Criar Usuário</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Users List */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Equipe Aura</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-zinc-50/30 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display italic text-lg ${user.role === "ADMIN" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-zinc-950">{user.name}</h3>
                                <p className="text-[10px] text-zinc-400 lowercase tracking-wider">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold ${user.role === "ADMIN" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                              {user.role === "ADMIN" ? (
                                <><Shield size={10} className="mr-2" /> Admin</>
                              ) : (
                                <><ShieldCheck size={10} className="mr-2" /> Editor</>
                              )}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            {user.id !== currentUser.id && (
                              <button 
                                onClick={async () => {
                                  if (confirm("Remover este usuário?")) {
                                    await deleteUser(user.id);
                                  }
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-200 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
