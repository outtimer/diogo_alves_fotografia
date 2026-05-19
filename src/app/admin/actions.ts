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
      sameSite: "none",
      secure: true,
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
  const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
  const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;

  if (!url || !title || !category) return;

  try {
    await prisma.photo.create({
      data: { url, title, location, category, lat, lng },
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
    const [siteContent, footerConfig, homeConfig, aboutConfig, contactConfig] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.footerConfig.findUnique({ where: { id: "default" } }),
      prisma.homeConfig.findUnique({ where: { id: "default" } }),
      prisma.aboutConfig.findUnique({ where: { id: "default" } }),
      prisma.contactConfig.findUnique({ where: { id: "default" } })
    ]);

    const content = siteContent.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (footerConfig) {
      content["footer_cta_title"] = footerConfig.ctaTitle || "";
      content["footer_cta_desc"] = footerConfig.ctaDesc || "";
      content["footer_copyright"] = footerConfig.copyright || "";
      content["footer_tagline"] = footerConfig.tagline || "";
      content["social_instagram"] = footerConfig.socialInstagram || "";
      content["social_twitter"] = footerConfig.socialTwitter || "";
      content["social_facebook"] = footerConfig.socialFacebook || "";
      content["social_behance"] = footerConfig.socialBehance || "";
      content["social_flickr"] = footerConfig.socialFlickr || "";
      content["social_500px"] = footerConfig.social500px || "";
      content["social_linkedin"] = footerConfig.socialLinkedin || "";
      content["social_pinterest"] = footerConfig.socialPinterest || "";
      content["social_vero"] = footerConfig.socialVero || "";
      content["social_unsplash"] = footerConfig.socialUnsplash || "";
    }

    if (homeConfig) {
      content["home_title_1"] = homeConfig.title1 || "";
      content["home_title_2"] = homeConfig.title2 || "";
      content["home_subtitle"] = homeConfig.subtitle || "";
      content["home_hero_bg_url"] = homeConfig.heroBgUrl || "";
      content["home_hero_main_text"] = homeConfig.mainText || "";
      content["home_gallery_title"] = homeConfig.galleryTitle || "";
      content["home_blog_title"] = homeConfig.blogTitle || "";
    }

    if (aboutConfig) {
      content["about_greeting"] = aboutConfig.greeting || "";
      content["about_title_normal"] = aboutConfig.titleNormal || "";
      content["about_title_styled"] = aboutConfig.titleStyled || "";
      content["about_bio"] = aboutConfig.bio || "";
      content["about_years"] = aboutConfig.years || "";
      content["about_equipment"] = aboutConfig.equipment || "";
      content["about_address"] = aboutConfig.address || "";
      content["about_link_text"] = aboutConfig.linkText || "";
      content["about_photo_url"] = aboutConfig.photoUrl || "";
    }

    if (contactConfig) {
      content["contact_title_normal"] = contactConfig.titleNormal || "";
      content["contact_title_styled"] = contactConfig.titleStyled || "";
      content["contact_subtitle"] = contactConfig.subtitle || "";
      content["contact_info_title"] = contactConfig.infoTitle || "";
      content["contact_info_desc"] = contactConfig.infoDesc || "";
      content["contact_email"] = contactConfig.email || "";
    }

    return content;
  } catch (error) {
    console.error("Erro ao buscar conteúdo do site:", error);
    return {} as Record<string, string>;
  }
}

export async function updateSiteContent(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  const entries = Array.from(formData.entries());
  const footerFields: Record<string, string> = {};
  const homeFields: Record<string, string> = {};
  const aboutFields: Record<string, string> = {};
  const contactFields: Record<string, string> = {};
  const otherFields: Record<string, string> = {};

  const footerMap: Record<string, string> = {
    "footer_cta_title": "ctaTitle",
    "footer_cta_desc": "ctaDesc",
    "footer_copyright": "copyright",
    "footer_tagline": "tagline",
    "social_instagram": "socialInstagram",
    "social_twitter": "socialTwitter",
    "social_facebook": "socialFacebook",
    "social_behance": "socialBehance",
    "social_flickr": "socialFlickr",
    "social_500px": "social500px",
    "social_linkedin": "socialLinkedin",
    "social_pinterest": "socialPinterest",
    "social_vero": "socialVero",
    "social_unsplash": "socialUnsplash"
  };

  const homeMap: Record<string, string> = {
    "home_title_1": "title1",
    "home_title_2": "title2",
    "home_subtitle": "subtitle",
    "home_hero_bg_url": "heroBgUrl",
    "home_hero_main_text": "mainText",
    "home_gallery_title": "galleryTitle",
    "home_blog_title": "blogTitle"
  };

  const aboutMap: Record<string, string> = {
    "about_greeting": "greeting",
    "about_title_normal": "titleNormal",
    "about_title_styled": "titleStyled",
    "about_bio": "bio",
    "about_years": "years",
    "about_equipment": "equipment",
    "about_address": "address",
    "about_link_text": "linkText",
    "about_photo_url": "photoUrl"
  };

  const contactMap: Record<string, string> = {
    "contact_title_normal": "titleNormal",
    "contact_title_styled": "titleStyled",
    "contact_subtitle": "subtitle",
    "contact_info_title": "infoTitle",
    "contact_info_desc": "infoDesc",
    "contact_email": "email"
  };
  
  for (const [key, value] of entries) {
    if (typeof value === "string") {
      if (footerMap[key]) {
        footerFields[footerMap[key]] = value;
      } else if (homeMap[key]) {
        homeFields[homeMap[key]] = value;
      } else if (aboutMap[key]) {
        aboutFields[aboutMap[key]] = value;
      } else if (contactMap[key]) {
        contactFields[contactMap[key]] = value;
      } else {
        otherFields[key] = value;
      }
    }
  }

  // Update Sections
  const updatePromises = [];

  if (Object.keys(footerFields).length > 0) {
    updatePromises.push(prisma.footerConfig.upsert({
      where: { id: "default" },
      update: footerFields,
      create: { id: "default", ...footerFields },
    }));
  }

  if (Object.keys(homeFields).length > 0) {
    updatePromises.push(prisma.homeConfig.upsert({
      where: { id: "default" },
      update: homeFields,
      create: { id: "default", ...homeFields },
    }));
  }

  if (Object.keys(aboutFields).length > 0) {
    updatePromises.push(prisma.aboutConfig.upsert({
      where: { id: "default" },
      update: aboutFields,
      create: { id: "default", ...aboutFields },
    }));
  }

  if (Object.keys(contactFields).length > 0) {
    updatePromises.push(prisma.contactConfig.upsert({
      where: { id: "default" },
      update: contactFields,
      create: { id: "default", ...contactFields },
    }));
  }

  await Promise.all(updatePromises);

  // Update remaining SiteContent
  for (const [key, value] of Object.entries(otherFields)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
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
