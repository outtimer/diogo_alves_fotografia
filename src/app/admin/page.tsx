import { getPhotos, getPosts, getSiteContent, isAuthenticated, logout } from "./actions";
import { LogOut } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const photos = await getPhotos();
  const posts = await getPosts();
  const content = await getSiteContent();

  return (
    <div className="min-h-screen bg-[#fbfbf8] p-6 md:p-12 font-sans pt-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-display text-4xl md:text-6xl text-zinc-950 italic leading-tight">Painel de Controle</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] mt-4 opacity-40 font-medium">Gestão de Conteúdo • Aura</p>
          </div>
          <form action={logout}>
            <button className="flex items-center text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-2">
              Sair <LogOut size={12} className="ml-2" />
            </button>
          </form>
        </header>

        <AdminDashboard initialPhotos={photos} initialPosts={posts} initialContent={content} />
      </div>
    </div>
  );
}
