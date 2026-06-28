"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addPhoto, updatePhoto, deletePhoto, addPost, deletePost, updateSiteContent, uploadImage, addUser, updateUser, deleteUser, addCategory, deleteCategory } from "@/app/admin/actions";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2, Plus, Edit, ImageIcon, FileText, MapPin, Tag, Calendar, AlignLeft, Home, User, Mail, Save, LayoutDashboard, Settings, TrendingUp, Eye, ArrowUpRight, Upload, Loader2, Link as LinkIcon, Users, Shield, ShieldAlert, ShieldCheck, Globe, Search, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import CityAutocomplete from "./CityAutocomplete";

interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
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

interface Category {
  id: string;
  name: string;
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
  initialCategories: Category[];
  currentUser: { id: string, name: string, email: string, role: string };
  googleMapsApiKey: string;
}

export default function AdminDashboard({ 
  initialPhotos, 
  initialPosts, 
  initialContent,
  analytics = [],
  topPhotos = [],
  topPosts = [],
  users = [],
  initialCategories = [],
  currentUser,
  googleMapsApiKey // Keeping for compatibility in props but not using
}: AdminDashboardProps) {
  const router = useRouter();
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingBlog, setIsUploadingBlog] = useState(false);
  const [isUploadingHomeBg, setIsUploadingHomeBg] = useState(false);
  const [isUploadingAboutHome, setIsUploadingAboutHome] = useState(false);
  const [isUploadingAboutPage, setIsUploadingAboutPage] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedBlogUrl, setUploadedBlogUrl] = useState("");
  const [uploadedHomeBgUrl, setUploadedHomeBgUrl] = useState(initialContent["home_hero_bg_url"] || "");
  const [uploadedAboutHomePhotoUrl, setUploadedAboutHomePhotoUrl] = useState(initialContent["about_home_photo_url"] !== undefined ? initialContent["about_home_photo_url"] : (initialContent["about_photo_url"] || ""));
  const [uploadedAboutPagePhotoUrl, setUploadedAboutPagePhotoUrl] = useState(initialContent["about_page_photo_url"] !== undefined ? initialContent["about_page_photo_url"] : (initialContent["about_photo_url"] || ""));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUploadedHomeBgUrl(initialContent["home_hero_bg_url"] || "");
  }, [initialContent["home_hero_bg_url"]]);

  useEffect(() => {
    setUploadedAboutHomePhotoUrl(initialContent["about_home_photo_url"] !== undefined ? initialContent["about_home_photo_url"] : (initialContent["about_photo_url"] || ""));
  }, [initialContent["about_home_photo_url"], initialContent["about_photo_url"]]);

  useEffect(() => {
    setUploadedAboutPagePhotoUrl(initialContent["about_page_photo_url"] !== undefined ? initialContent["about_page_photo_url"] : (initialContent["about_photo_url"] || ""));
  }, [initialContent["about_page_photo_url"], initialContent["about_photo_url"]]);

  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  useEffect(() => {
    if (editingPhoto) {
      setUploadedUrl(editingPhoto.url);
    } else {
      setUploadedUrl("");
    }
  }, [editingPhoto]);

  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoFormKey, setPhotoFormKey] = useState(0);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postFormKey, setPostFormKey] = useState(0);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const uploadImageClient = async (formData: FormData): Promise<{ url?: string; error?: string }> => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // ignore
        }
        if (errorData?.error) {
          return { error: errorData.error };
        }
        if (errorText.trim().startsWith("<")) {
          const titleMatch = errorText.match(/<title>([\s\S]*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : "";
          return { error: `Erro ${res.status}: ${title || "Resposta HTML inválida do servidor"}` };
        }
        return { error: `Erro HTTP ${res.status}: ${errorText.substring(0, 100)}${errorText.length > 100 ? "..." : ""}` };
      }
      return await res.json();
    } catch (err: any) {
      return { error: err.message || "Erro de rede no upload" };
    }
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;
    setIsDeletingPhoto(true);
    try {
      const res = await deletePhoto(photoToDelete.id);
      if (res && res.error) {
        showNotification("Erro ao excluir obra: " + res.error, "error");
      } else {
        showNotification("Obra excluída com sucesso!", "success");
        router.refresh();
      }
    } catch (err: any) {
      showNotification("Erro ao excluir obra: " + (err.message || err), "error");
    } finally {
      setIsDeletingPhoto(false);
      setPhotoToDelete(null);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedUrl) {
      showNotification("Por favor, faça o upload de uma imagem primeiro.", "error");
      return;
    }
    setIsSavingPhoto(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("url", uploadedUrl);
      
      let res;
      if (editingPhoto) {
        formData.set("id", editingPhoto.id);
        res = await updatePhoto(formData);
      } else {
        res = await addPhoto(formData);
      }

      if (res && res.error) {
        showNotification("Erro ao salvar obra: " + res.error, "error");
      } else {
        if (editingPhoto) {
          showNotification("Obra atualizada com sucesso!", "success");
          setEditingPhoto(null);
        } else {
          showNotification("Obra adicionada à galeria com sucesso!", "success");
        }
        setUploadedUrl("");
        setPhotoFormKey(prev => prev + 1);
        router.refresh();
      }
    } catch (error: any) {
      showNotification("Erro ao salvar obra: " + (error.message || error), "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedBlogUrl) {
      showNotification("Por favor, faça o upload de uma imagem de capa primeiro.", "error");
      return;
    }
    setIsSavingPost(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("image", uploadedBlogUrl);
      const res = await addPost(formData);
      if (res && res.error) {
        showNotification("Erro ao salvar post: " + res.error, "error");
      } else {
        showNotification("Post publicado com sucesso!", "success");
        setUploadedBlogUrl("");
        setPostFormKey(prev => prev + 1);
        router.refresh();
      }
    } catch (error: any) {
      showNotification("Erro ao salvar post: " + (error.message || error), "error");
    } finally {
      setIsSavingPost(false);
    }
  };

  const isAdmin = currentUser.role === "ADMIN";

  const tabs = [
    { id: "dashboard", label: "Métricas", icon: LayoutDashboard },
    { id: "photos", label: "Galeria", icon: ImageIcon },
    { id: "categories", label: "Categorias", icon: Tag },
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

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await updateSiteContent(formData);
            showNotification("Alterações salvas com sucesso!", "success");
            router.refresh();
          } catch (error: any) {
            showNotification("Erro ao salvar alterações: " + (error.message || error), "error");
          }
        }} 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
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

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
      </div>
    );
  }

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
          <div key="photos" className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Photo Form - Centered and elegant */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50 max-w-4xl mx-auto">
                <h2 className="text-xl font-display italic mb-10 flex items-center text-zinc-950 justify-between">
                  <span className="flex items-center">
                    {editingPhoto ? (
                      <>
                        <Edit size={24} className="mr-3 text-zinc-400" /> Editar Obra: &ldquo;{editingPhoto.title}&rdquo;
                      </>
                    ) : (
                      <>
                        <Plus size={24} className="mr-3 text-zinc-400" /> Nova Obra
                      </>
                    )}
                  </span>
                  {editingPhoto && (
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-950 transition-colors uppercase tracking-widest font-bold border border-zinc-200 rounded-xl px-3 py-1.5 cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </h2>
                <form key={editingPhoto ? `edit-${editingPhoto.id}-${photoFormKey}` : `new-${photoFormKey}`} onSubmit={handlePhotoSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Imagem da Obra</label>
                    <input type="hidden" name="url" value={uploadedUrl} required />
                    
                    <div className="relative group w-full">
                      {uploadedUrl ? (
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                          <img src={uploadedUrl} alt="Preview da Obra" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setUploadedUrl("")}
                              className="bg-white/90 hover:bg-white text-red-600 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg pointer-events-auto"
                            >
                              <Trash2 size={12} /> Remover e trocar imagem
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.size > 40 * 1024 * 1024) {
                                showNotification("A imagem não pode ser maior que 40MB.", "error");
                                return;
                              }
                              
                              setIsUploadingGallery(true);
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                const result = await uploadImageClient(formData);
                                if (result.error) {
                                  showNotification("Erro no upload: " + result.error, "error");
                                } else if (result.url) {
                                  setUploadedUrl(result.url);
                                } else {
                                  showNotification("Erro inesperado no upload.", "error");
                                }
                              } catch (error: any) {
                                showNotification("Erro no upload: " + (error.message || error), "error");
                              } finally {
                                  setIsUploadingGallery(false);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-full min-h-[200px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                            {isUploadingGallery ? (
                              <Loader2 size={28} className="text-zinc-400 animate-spin" />
                            ) : (
                              <Upload size={28} className="text-zinc-300" />
                            )}
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold text-center">
                              {isUploadingGallery ? "Enviando imagem..." : "Arraste ou clique para fazer upload da foto"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título</label>
                      <input name="title" type="text" defaultValue={editingPhoto?.title || ""} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Localização (Cidade ou Local)</label>
                      <CityAutocomplete 
                        name="location"
                        defaultValue={editingPhoto?.location || ""}
                        onCitySelect={(city) => {
                          // Set hidden inputs
                          const latInput = document.querySelector('input[name="lat"]') as HTMLInputElement;
                          const lngInput = document.querySelector('input[name="lng"]') as HTMLInputElement;
                          if (latInput) latInput.value = city?.lat?.toString() || "";
                          if (lngInput) lngInput.value = city?.lng?.toString() || "";
                        }} 
                      />
                      <input type="hidden" name="lat" defaultValue={editingPhoto?.lat?.toString() || ""} />
                      <input type="hidden" name="lng" defaultValue={editingPhoto?.lng?.toString() || ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Descrição / História sobre a Foto</label>
                    <textarea 
                      name="description" 
                      rows={4} 
                      defaultValue={editingPhoto?.description || ""} 
                      placeholder="Conte a história por trás desta foto... (Esta história ficará oculta na galeria por enquanto)" 
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Categoria</label>
                      <select name="category" defaultValue={editingPhoto?.category || ""} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all appearance-none">
                        {initialCategories.length === 0 ? (
                          <>
                            <option value="Landscape">Paisagem</option>
                            <option value="Urban">Urbano</option>
                            <option value="Wildlife">Vida Selvagem</option>
                            <option value="Daily">Cotidiano</option>
                          </>
                        ) : (
                          initialCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        disabled={isSavingPhoto}
                        className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSavingPhoto ? (
                          <Loader2 size={16} className="mr-3 animate-spin" />
                        ) : (
                          <Save size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
                        )}
                        <span className="text-[10px] uppercase tracking-[0.2em]">
                          {isSavingPhoto ? (editingPhoto ? "Salvando..." : "Adicionando...") : (editingPhoto ? "Salvar Alterações" : "Adicionar à Galeria")}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Photo List (Acervo) - Centered and elegant */}
              <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Acervo de Fotos ({initialPhotos.length})</span>
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
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingPhoto(photo);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setPhotoToDelete(photo);
                                  }}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                  title="Apagar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "categories" && (
          <div key="categories" className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50">
                <h2 className="text-xl font-display italic mb-4 flex items-center text-zinc-950">
                  <Tag size={24} className="mr-3 text-zinc-400" /> Categorias
                </h2>
                <p className="text-xs text-zinc-400 mb-10">Crie e remova as categorias que agrupam suas obras fotográficas na galeria.</p>
                <form action={async (formData) => {
                  try {
                    await addCategory(formData);
                    showNotification("Categoria adicionada com sucesso!", "success");
                    router.refresh();
                  } catch (error: any) {
                    showNotification(error.message || error, "error");
                  }
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Nova Categoria</label>
                    <div className="relative flex gap-2">
                      <input name="name" type="text" required placeholder="Ex: Black & White" className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                      <button type="submit" className="bg-zinc-950 text-white px-8 rounded-2xl hover:bg-zinc-800 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Plus size={16} /> Adicionar
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-10 pt-10 border-t border-zinc-50">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-6">Categorias Cadastradas</h3>
                  <div className="flex flex-wrap gap-3">
                    {initialCategories.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">Nenhuma categoria cadastrada.</p>
                    ) : (
                      initialCategories.map((cat) => (
                        <div key={cat.id} className="group flex items-center gap-3 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full hover:border-red-100 hover:bg-red-50/30 transition-all">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">{cat.name}</span>
                          <button 
                            onClick={async () => {
                              if (confirm(`Deletar categoria "${cat.name}"?`)) {
                                try {
                                  await deleteCategory(cat.id);
                                  showNotification("Categoria excluída com sucesso!", "success");
                                  router.refresh();
                                } catch (error: any) {
                                  showNotification(error.message || error, "error");
                                }
                              }
                            }}
                            className="text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "posts" && (
          <div key="posts" className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Blog Visibility Toggle */}
              <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-50 p-3 rounded-2xl">
                    <Eye size={20} className="text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">Exibição do Blog</h3>
                    <p className="text-xs text-zinc-400 mt-1">Ative ou desative a exibição do Blog/Histórias na página inicial e no menu lateral para seus visitantes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      try {
                        await updateSiteContent(formData);
                        showNotification("Visibilidade do blog atualizada!", "success");
                        router.refresh();
                      } catch (error: any) {
                        showNotification("Erro ao atualizar visibilidade: " + (error.message || error), "error");
                      }
                    }} 
                    className="flex items-center gap-3"
                  >
                    <input type="hidden" name="show_blog" value={initialContent["show_blog"] === "true" ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        initialContent["show_blog"] === "true" ? "bg-zinc-950" : "bg-zinc-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          initialContent["show_blog"] === "true" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                      {initialContent["show_blog"] === "true" ? "Visível" : "Oculto"}
                    </span>
                  </form>
                </div>
              </div>

              {/* Post Form - Centered and elegant */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50 max-w-4xl mx-auto">
                <h2 className="text-xl font-display italic mb-10 flex items-center text-zinc-950">
                  <Plus size={24} className="mr-3 text-zinc-400" /> Nova História
                </h2>
                <form key={postFormKey} onSubmit={handlePostSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Imagem de Capa</label>
                    <input type="hidden" name="image" value={uploadedBlogUrl} required />
                    
                    <div className="relative group w-full">
                      {uploadedBlogUrl ? (
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                          <img src={uploadedBlogUrl} alt="Preview da Capa" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setUploadedBlogUrl("")}
                              className="bg-white/90 hover:bg-white text-red-600 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg pointer-events-auto"
                            >
                              <Trash2 size={12} /> Remover e trocar imagem
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.size > 40 * 1024 * 1024) {
                                showNotification("A imagem não pode ser maior que 40MB.", "error");
                                return;
                              }
                              
                              setIsUploadingBlog(true);
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                const result = await uploadImageClient(formData);
                                if (result.error) {
                                  showNotification("Erro no upload: " + result.error, "error");
                                } else if (result.url) {
                                  setUploadedBlogUrl(result.url);
                                } else {
                                  showNotification("Erro inesperado no upload.", "error");
                                }
                              } catch (error: any) {
                                showNotification("Erro no upload: " + (error.message || error), "error");
                              } finally {
                                const setIsUploadingBlog_val = false; // keep clean
                                setIsUploadingBlog(false);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-full min-h-[200px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                            {isUploadingBlog ? (
                              <Loader2 size={28} className="text-zinc-400 animate-spin" />
                            ) : (
                              <Upload size={28} className="text-zinc-300" />
                            )}
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold text-center">
                              {isUploadingBlog ? "Enviando imagem..." : "Arraste ou clique para fazer upload da capa"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título</label>
                      <input name="title" type="text" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Resumo (Pílula)</label>
                      <textarea name="excerpt" rows={2} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Conteúdo Narrativo</label>
                    <textarea name="content" rows={6} required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSavingPost}
                      className="w-full md:w-auto md:px-12 bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingPost ? (
                        <Loader2 size={16} className="mr-3 animate-spin" />
                      ) : (
                        <Plus size={16} className="mr-3 group-hover:rotate-90 transition-transform" />
                      )}
                      <span className="text-[10px] uppercase tracking-[0.2em]">
                        {isSavingPost ? "Publicando..." : "Publicar História"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Post List (Acervo) - Centered and elegant */}
              <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Blog Cronológico ({initialPosts.length})</span>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                  </div>
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
                              <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden relative shadow-md group-hover:scale-[1.05] transition-transform duration-500">
                                {post.image ? (
                                  <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
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
                                    try {
                                      await deletePost(post.id);
                                      showNotification("Post excluído com sucesso!", "success");
                                      router.refresh();
                                    } catch (err: any) {
                                      showNotification("Erro ao excluir post: " + (err.message || err), "error");
                                    }
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
            </motion.div>
          </div>
        )}

        {activeTab === "home" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-display italic text-zinc-950 mb-2">Editar Seção</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Página Inicial</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl">
                <Home size={20} className="text-zinc-400" />
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await updateSiteContent(formData);
                  showNotification("Página Inicial atualizada com sucesso!", "success");
                  router.refresh();
                } catch (error: any) {
                  showNotification("Erro ao atualizar Página Inicial: " + (error.message || error), "error");
                }
              }} 
              className="space-y-8"
            >
              {/* Image Upload Block (Fundo Atmosférico) */}
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Fundo Atmosférico (Imagem de Fundo)</label>
                <input type="hidden" name="home_hero_bg_url" value={uploadedHomeBgUrl} />
                
                <div className="relative group w-full">
                  {uploadedHomeBgUrl ? (
                    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                      <img src={uploadedHomeBgUrl} alt="Preview do Fundo Atmosférico" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setUploadedHomeBgUrl("")}
                          className="bg-white/90 hover:bg-white text-red-600 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg pointer-events-auto"
                        >
                          <Trash2 size={12} /> Remover e trocar imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 40 * 1024 * 1024) {
                            showNotification("A imagem não pode ser maior que 40MB.", "error");
                            return;
                          }
                          
                          setIsUploadingHomeBg(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const result = await uploadImageClient(formData);
                            if (result.error) {
                              showNotification("Erro no upload: " + result.error, "error");
                            } else if (result.url) {
                              setUploadedHomeBgUrl(result.url);
                            } else {
                              showNotification("Erro inesperado no upload.", "error");
                            }
                          } catch (error: any) {
                            showNotification("Erro no upload: " + (error.message || error), "error");
                          } finally {
                            setIsUploadingHomeBg(false);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="w-full min-h-[220px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                        {isUploadingHomeBg ? (
                          <Loader2 size={28} className="text-zinc-400 animate-spin" />
                        ) : (
                          <Upload size={28} className="text-zinc-300" />
                        )}
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold text-center">
                          {isUploadingHomeBg ? "Enviando imagem..." : "Arraste ou clique para fazer upload da foto de fundo"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid with Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Hero (Parte 1)</label>
                  <input 
                    name="home_hero_title_1" 
                    type="text" 
                    defaultValue={initialContent["home_hero_title_1"] || ""}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Hero (Estilizado)</label>
                  <input 
                    name="home_hero_title_2" 
                    type="text" 
                    defaultValue={initialContent["home_hero_title_2"] || ""}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Subtítulo Hero</label>
                  <input 
                    name="home_hero_subtitle" 
                    type="text" 
                    defaultValue={initialContent["home_hero_subtitle"] || ""}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Texto Narrativo Hero</label>
                  <textarea 
                    name="home_hero_main_text" 
                    defaultValue={initialContent["home_hero_main_text"] || ""}
                    rows={4}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Curadoria</label>
                  <input 
                    name="home_gallery_title" 
                    type="text" 
                    defaultValue={initialContent["home_gallery_title"] || ""}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Crônicas</label>
                  <input 
                    name="home_blog_title" 
                    type="text" 
                    defaultValue={initialContent["home_blog_title"] || ""}
                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all font-bold flex items-center justify-center group">
                  <Save size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Salvar Alterações</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-zinc-100 p-8 md:p-12 shadow-xl shadow-zinc-200/50 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-display italic text-zinc-950 mb-2">Editar Seção</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Sobre Mim</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl">
                <User size={20} className="text-zinc-400" />
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await updateSiteContent(formData);
                  showNotification("Seção Sobre Mim atualizada com sucesso!", "success");
                  router.refresh();
                } catch (error: any) {
                  showNotification("Erro ao atualizar Seção Sobre: " + (error.message || error), "error");
                }
              }} 
              className="space-y-12"
            >
              
              {/* === PARTE 1: PÁGINA INICIAL === */}
              <div className="space-y-8 pb-8 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-zinc-950 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Sobre na Página Inicial (Home)</h3>
                </div>

                {/* Home Image Upload Block */}
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Retrato na Página Inicial (Formato Circular)</label>
                  <input type="hidden" name="about_home_photo_url" value={uploadedAboutHomePhotoUrl} />
                  
                  <div className="relative group w-full">
                    {uploadedAboutHomePhotoUrl ? (
                      <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-zinc-50 border border-zinc-100 rounded-full overflow-hidden shadow-sm">
                        <img src={uploadedAboutHomePhotoUrl} alt="Preview do Retrato Home" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setUploadedAboutHomePhotoUrl("")}
                            className="bg-white/90 hover:bg-white text-red-600 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg pointer-events-auto"
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative max-w-[200px] mx-auto">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (file.size > 40 * 1024 * 1024) {
                              showNotification("A imagem não pode ser maior que 40MB.", "error");
                              return;
                            }
                            
                            setIsUploadingAboutHome(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const result = await uploadImageClient(formData);
                              if (result.error) {
                                showNotification("Erro no upload: " + result.error, "error");
                              } else if (result.url) {
                                setUploadedAboutHomePhotoUrl(result.url);
                              } else {
                                showNotification("Erro inesperado no upload.", "error");
                              }
                            } catch (error: any) {
                              showNotification("Erro no upload: " + (error.message || error), "error");
                            } finally {
                              setIsUploadingAboutHome(false);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-full p-8 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                          {isUploadingAboutHome ? (
                            <Loader2 size={24} className="text-zinc-400 animate-spin" />
                          ) : (
                            <Upload size={24} className="text-zinc-300" />
                          )}
                          <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold text-center">
                            {isUploadingAboutHome ? "Enviando..." : "Enviar Foto"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Saudação Atmosférica</label>
                    <input 
                      name="about_home_greeting" 
                      type="text" 
                      defaultValue={initialContent["about_home_greeting"] || initialContent["about_greeting"] || ""}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">CTA Botão Trajetória</label>
                    <input 
                      name="about_home_link_text" 
                      type="text" 
                      defaultValue={initialContent["about_home_link_text"] || initialContent["about_link_text"] || ""}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Identidade (Texto Normal)</label>
                    <input 
                      name="about_home_title_normal" 
                      type="text" 
                      defaultValue={initialContent["about_home_title_normal"] || initialContent["about_title_normal"] || ""}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Identidade (Texto Estilizado)</label>
                    <input 
                      name="about_home_title_styled" 
                      type="text" 
                      defaultValue={initialContent["about_home_title_styled"] || initialContent["about_title_styled"] || ""}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Manifesto / Bio Curta (Homepage)</label>
                    <textarea 
                      name="about_home_bio" 
                      defaultValue={initialContent["about_home_bio"] || initialContent["about_bio"] || ""}
                      rows={3}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* === PARTE 2: PÁGINA COMPLETA === */}
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-zinc-950 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Sobre na Página Completa (/about)</h3>
                </div>

                {/* Page Image Upload Block */}
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Retrato Principal na Biografia Completa (Formato Retangular)</label>
                  <input type="hidden" name="about_page_photo_url" value={uploadedAboutPagePhotoUrl} />
                  
                  <div className="relative group w-full">
                    {uploadedAboutPagePhotoUrl ? (
                      <div className="relative w-full aspect-[3/4] max-w-[240px] mx-auto bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                        <img src={uploadedAboutPagePhotoUrl} alt="Preview do Retrato Page" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setUploadedAboutPagePhotoUrl("")}
                            className="bg-white/90 hover:bg-white text-red-600 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg pointer-events-auto"
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative max-w-[240px] mx-auto">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (file.size > 40 * 1024 * 1024) {
                              showNotification("A imagem não pode ser maior que 40MB.", "error");
                              return;
                            }
                            
                            setIsUploadingAboutPage(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const result = await uploadImageClient(formData);
                              if (result.error) {
                                showNotification("Erro no upload: " + result.error, "error");
                              } else if (result.url) {
                                setUploadedAboutPagePhotoUrl(result.url);
                              } else {
                                showNotification("Erro inesperado no upload.", "error");
                              }
                            } catch (error: any) {
                              showNotification("Erro no upload: " + (error.message || error), "error");
                            } finally {
                              setIsUploadingAboutPage(false);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full aspect-[3/4] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-zinc-950/20 group-hover:bg-zinc-100/50">
                          {isUploadingAboutPage ? (
                            <Loader2 size={24} className="text-zinc-400 animate-spin" />
                          ) : (
                            <Upload size={24} className="text-zinc-300" />
                          )}
                          <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold text-center">
                            {isUploadingAboutPage ? "Enviando..." : "Enviar Foto Retrato"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Título Grande da Página (e.g. &quot;apaixonado por café&quot;)</label>
                    <input 
                      name="about_page_title" 
                      type="text" 
                      defaultValue={initialContent["about_page_title"] || `Sobre ${initialContent["about_title_styled"] || "Diogo Alves"}`}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Subtítulo Identidade / Visão</label>
                    <input 
                      name="about_page_subtitle" 
                      type="text" 
                      defaultValue={initialContent["about_page_subtitle"] || initialContent["about_title_normal"] || "A busca pelo invisível."}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Tempo de Luz (e.g. &quot;10+&quot; Anos)</label>
                    <input 
                      name="about_page_years" 
                      type="text" 
                      defaultValue={initialContent["about_page_years"] || initialContent["about_years"] || "10+"}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Biografia Completa / Manifesto Narrativo</label>
                    <textarea 
                      name="about_page_bio" 
                      defaultValue={initialContent["about_page_bio"] || initialContent["about_bio"] || ""}
                      rows={6}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Equipamentos Utilizados (Linhas Separadas)</label>
                    <textarea 
                      name="about_page_equipment" 
                      defaultValue={initialContent["about_page_equipment"] || initialContent["about_equipment"] || ""}
                      rows={3}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Localização de Base (Linhas Separadas)</label>
                    <textarea 
                      name="about_page_address" 
                      defaultValue={initialContent["about_page_address"] || initialContent["about_address"] || ""}
                      rows={3}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300" 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Reconhecimento / Prêmios (Uma linha para cada prêmio)</label>
                    <textarea 
                      name="about_page_awards" 
                      defaultValue={initialContent["about_page_awards"] || "• National Geographic Photo of the Year (Finalist 2021)\n• International Photography Awards (Gold - Nature 2022)\n• Exhibition \"Urban Silence\" - Tokyo, Japan"}
                      rows={4}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all resize-none placeholder:text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all font-bold flex items-center justify-center group">
                  <Save size={16} className="mr-3 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Salvar Tudo</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

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
                {editingUser ? (
                  <>
                    <h2 className="text-lg font-display italic mb-8 flex items-center text-zinc-950">
                      <Edit size={20} className="mr-3 text-zinc-400" /> Editar Usuário
                    </h2>
                    <form 
                      key={`edit-${editingUser.id}`}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        try {
                          const result = await updateUser(editingUser.id, formData);
                          if (result && result.error) {
                            showNotification(result.error, "error");
                          } else {
                            showNotification("Usuário atualizado com sucesso!", "success");
                            setEditingUser(null);
                            router.refresh();
                          }
                        } catch (error: any) {
                          showNotification("Erro ao atualizar usuário: " + (error.message || error), "error");
                        }
                      }} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Nome Completo</label>
                        <input name="name" type="text" required defaultValue={editingUser.name} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">E-mail</label>
                        <input name="email" type="email" required defaultValue={editingUser.email} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Senha</label>
                          <span className="text-[9px] text-zinc-400 font-normal">Deixe em branco para manter</span>
                        </div>
                        <input name="password" type="password" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" placeholder="Nova senha (mín. 6 caracteres)" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold ml-1">Cargo / Nível</label>
                        <select name="role" required defaultValue={editingUser.role} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all appearance-none">
                          <option value="EDITOR">Editor (Conteúdo)</option>
                          <option value="ADMIN">Administrador (Total)</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setEditingUser(null)} className="w-1/3 border border-zinc-200 text-zinc-600 rounded-2xl py-4 hover:bg-zinc-50 transition-all font-bold text-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-xs">Cancelar</span>
                        </button>
                        <button type="submit" className="w-2/3 bg-zinc-950 text-white rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold flex items-center justify-center">
                          <Save size={16} className="mr-3" />
                          <span className="text-[10px] uppercase tracking-[0.2em]">Salvar</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-display italic mb-8 flex items-center text-zinc-950">
                      <User size={20} className="mr-3 text-zinc-400" /> Novo Usuário
                    </h2>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        try {
                          const result = await addUser(formData);
                          if (result && result.error) {
                            showNotification(result.error, "error");
                          } else {
                            showNotification("Usuário criado com sucesso!", "success");
                            e.currentTarget.reset();
                            router.refresh();
                          }
                        } catch (error: any) {
                          showNotification("Erro ao criar usuário: " + (error.message || error), "error");
                        }
                      }} 
                      className="space-y-6"
                    >
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
                        <input name="password" type="password" required className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all" placeholder="Mínimo de 6 caracteres" />
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
                  </>
                )}
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
                             <div className="flex justify-end items-center gap-2">
                               <button 
                                 onClick={() => setEditingUser(user)}
                                 className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
                                 title="Editar usuário"
                               >
                                 <Edit size={18} />
                               </button>
                               {user.id !== currentUser.id && (
                                 <button 
                                   onClick={async () => {
                                     if (confirm("Remover este usuário?")) {
                                       try {
                                         await deleteUser(user.id);
                                         showNotification("Usuário removido com sucesso!", "success");
                                         router.refresh();
                                       } catch (err: any) {
                                         showNotification("Erro ao remover usuário: " + (err.message || err), "error");
                                       }
                                     }
                                   }}
                                   className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-zinc-100 transition-all"
                                   title="Excluir usuário"
                                 >
                                   <Trash2 size={18} />
                                 </button>
                               )}
                             </div>
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

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-zinc-950 text-white border-zinc-800" 
            : toast.type === "error" 
            ? "bg-red-600 text-white border-red-500" 
            : "bg-zinc-100 text-zinc-900 border-zinc-200"
        }`}>
          {toast.type === "success" && <CheckCircle className="text-green-400 shrink-0" size={18} />}
          {toast.type === "error" && <AlertCircle className="text-white shrink-0" size={18} />}
          {toast.type === "info" && <Info className="text-zinc-500 shrink-0" size={18} />}
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 transition-opacity text-white/60 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {photoToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingPhoto && setPhotoToDelete(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                  <Trash2 size={28} />
                </div>
                
                <h3 className="text-lg font-display italic text-zinc-950">Confirmar Exclusão</h3>
                
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Tem certeza de que deseja excluir a obra <strong className="text-zinc-950 font-sans">&ldquo;{photoToDelete.title}&rdquo;</strong>? Esta ação é irreversível e o arquivo também será apagado permanentemente da nuvem (Canarycloud/Cloudinary).
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                  <button
                    type="button"
                    disabled={isDeletingPhoto}
                    onClick={() => setPhotoToDelete(null)}
                    className="flex-1 border border-zinc-200 hover:bg-zinc-50 rounded-2xl py-3.5 text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-950 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingPhoto}
                    onClick={handleDeleteConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingPhoto ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Excluindo...</span>
                      </>
                    ) : (
                      <span>Excluir</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
