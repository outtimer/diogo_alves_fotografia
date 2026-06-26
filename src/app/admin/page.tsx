import { getPhotos, getPosts, getSiteContent, logout, getAnalytics, getTopPhotos, getTopPosts, getLoggedInUser, getUsers, getCategories } from "./actions";
import { LogOut, Users } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentUser = await getLoggedInUser();
  if (!currentUser) {
    redirect("/login");
  }

  try {
    const [photos, posts, content, analytics, topPhotos, topPosts, users, categories] = await Promise.all([
      getPhotos(),
      getPosts(),
      getSiteContent(),
      getAnalytics(),
      getTopPhotos(),
      getTopPosts(),
      currentUser.role === "ADMIN" ? getUsers() : Promise.resolve([]),
      getCategories()
    ]);

    return (
      <div className="min-h-screen bg-[#fbfbf8] p-6 md:p-12 font-sans pt-32">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="font-display text-4xl md:text-6xl text-zinc-950 italic leading-tight">Painel de Controle</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] mt-4 opacity-40 font-medium">Gestão de Conteúdo • Aura</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-950">{currentUser.name}</p>
                <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold">{currentUser.role === "ADMIN" ? "Administrador" : "Editor"}</p>
              </div>
              <form action={logout}>
                <button className="flex items-center text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-2">
                  Sair <LogOut size={12} className="ml-2" />
                </button>
              </form>
            </div>
          </header>

          <AdminDashboard 
            initialPhotos={photos} 
            initialPosts={posts} 
            initialContent={content}
            analytics={analytics}
            topPhotos={topPhotos}
            topPosts={topPosts}
            users={users}
            initialCategories={categories}
            currentUser={currentUser}
            googleMapsApiKey=""
          />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Erro crítico no AdminPage:", error);
    return (
      <div className="min-h-screen bg-[#fbfbf8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-red-100 shadow-xl">
          <h1 className="text-2xl font-display italic text-red-600 mb-4">Erro de Conexão</h1>
          <p className="text-sm text-zinc-600 mb-6 font-sans">
            Não foi possível conectar ao banco de dados. Verifique se as variáveis de ambiente (DATABASE_URL e TURSO_AUTH_TOKEN) estão configuradas corretamente no Vercel.
          </p>
          <div className="text-left bg-zinc-50 p-4 rounded-xl mb-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Mensagem de Erro:</p>
            <p className="text-[11px] font-mono text-zinc-500 break-all">{error.message || "Erro desconhecido"}</p>
          </div>
          <a href="/admin" className="inline-block bg-zinc-950 text-white text-[10px] uppercase tracking-widest font-bold px-8 py-4 rounded-xl">
            Tentar Novamente
          </a>
        </div>
      </div>
    );
  }
}
