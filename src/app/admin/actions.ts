"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "aura_admin_session";

import { getCloudinary } from "@/lib/cloudinary";

export async function uploadImage(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  const file = formData.get("file") as File;
  if (!file) throw new Error("Nenhum arquivo enviado");

  const cloudinary = getCloudinary();
  if (!cloudinary) {
    throw new Error("Cloudinary não configurado. Adicione as chaves no painel de segredos.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<{ url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "portfolio" },
      (error, result) => {
        if (error) {
          console.error("Erro no Cloudinary:", error);
          reject(error);
        } else {
          resolve({ url: result!.secure_url });
        }
      }
    ).end(buffer);
  });
}

// Auxiliar para pegar o usuário logado
export async function getLoggedInUser() {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session?.value) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.value },
      select: { id: true, name: true, email: true, role: true }
    });
    return user;
  } catch (error) {
    return null;
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Preencha todos os campos" };

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return { error: "Credenciais inválidas" };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { error: "Credenciais inválidas" };

    // Login com cache de 24 horas (configurável)
    (await cookies()).set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    redirect("/admin");
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) throw error;
    console.error("Erro no login:", error);
    return { error: "Erro ao realizar login" };
  }
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function isAuthenticated() {
  const user = await getLoggedInUser();
  return !!user;
}

export async function isAdmin() {
  const user = await getLoggedInUser();
  return user?.role === "ADMIN";
}

export async function addPhoto(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  const url = formData.get("url") as string;
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const category = formData.get("category") as string;

  if (!url || !title || !category) return;

  try {
    await prisma.photo.create({
      data: { url, title, location, category },
    });
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erro ao salvar no banco de dados", error);
  }
}

export async function deletePhoto(id: string) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    await prisma.photo.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erro ao deletar foto", error);
  }
}

export async function getPhotos() {
  try {
    return await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}

export async function getPosts() {
  try {
    return await prisma.post.findMany({
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function addPost(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const image = formData.get("image") as string;

  if (!title || !excerpt || !content) return;

  try {
    await prisma.post.create({
      data: { title, excerpt, content, image },
    });
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erro ao salvar post no banco de dados", error);
  }
}

export async function deletePost(id: string) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Erro ao deletar post", error);
  }
}

export async function getSiteContent() {
  try {
    const content = await prisma.siteContent.findMany();
    return content.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.warn("Database not ready or SiteContent table missing. Returning empty content.");
    return {} as Record<string, string>;
  }
}

export async function updateSiteContent(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (typeof value === "string") {
      await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
}

export async function getAnalytics() {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  try {
    // Get last 30 days of visits
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await prisma.analytics.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { date: "asc" }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
}

export async function getTopPhotos(limit: number = 5) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    return await prisma.photo.findMany({
      orderBy: { views: "desc" },
      take: limit
    });
  } catch (error) {
    console.error("Error fetching top photos:", error);
    return [];
  }
}

export async function getTopPosts(limit: number = 5) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    return await prisma.post.findMany({
      orderBy: { views: "desc" },
      take: limit
    });
  } catch (error) {
    console.error("Error fetching top posts:", error);
    return [];
  }
}

export async function incrementView(type: "photo" | "post" | "visit", id?: string) {
  try {
    if (type === "photo" && id) {
      await prisma.photo.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    } else if (type === "post" && id) {
      await prisma.post.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    } else if (type === "visit") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await prisma.analytics.upsert({
        where: { date: today },
        update: { visits: { increment: 1 } },
        create: { date: today, visits: 1 }
      });
    }
  } catch (error) {
    console.error(`Erro ao incrementar views para ${type}:`, error);
  }
}

// ---- AÇÕES DE USUÁRIOS ----

export async function getUsers() {
  if (!(await isAdmin())) throw new Error("Acesso restrito");
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function addUser(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Acesso restrito");
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) throw new Error("Campos obrigatórios faltando");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, role }
  });

  revalidatePath("/admin");
}

export async function deleteUser(id: string) {
  if (!(await isAdmin())) throw new Error("Acesso restrito");
  
  // Não permitir deletar a si mesmo por segurança
  const currentUser = await getLoggedInUser();
  if (currentUser?.id === id) throw new Error("Você não pode deletar sua própria conta");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}
