"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  // Em um app real, verificaríamos no banco com hash. 
  // Para este protótipo, usaremos uma senha simples.
  if (password === "admin123") {
    (await cookies()).set(SESSION_COOKIE, "true", {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24, // 24 horas
    });
    redirect("/admin");
  } else {
    return { error: "Senha incorreta" };
  }
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function isAuthenticated() {
  return (await cookies()).has(SESSION_COOKIE);
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
