"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "aura_admin_session";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  // Em um app real, verificaríamos no banco com hash. 
  // Para este protótipo, usaremos uma senha simples.
  if (password === "admin123") {
    (await cookies()).set(SESSION_COOKIE, "true", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
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
  return await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getPosts() {
  return await prisma.post.findMany({
    orderBy: { date: "desc" },
  });
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
  const content = await prisma.siteContent.findMany();
  return content.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
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
