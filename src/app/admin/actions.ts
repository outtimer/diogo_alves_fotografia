"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "aura_admin_session";

import { getCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await isAuthenticated())) {
    return { error: "Não autorizado. Por favor, faça login novamente." };
  }
  
  const file = formData.get("file") as File;
  if (!file) {
    return { error: "Nenhum arquivo enviado." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinary = getCloudinary();
    if (!cloudinary) {
      console.log("Cloudinary não configurado. Utilizando fallback Base64.");
      const mimeType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      return { url: `data:${mimeType};base64,${base64}` };
    }

    return await new Promise<{ url?: string; error?: string }>((resolve) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "portfolio" },
        (error, result) => {
          if (error) {
            console.error("Erro no Cloudinary, usando fallback Base64:", error);
            const mimeType = file.type || "image/jpeg";
            const base64 = buffer.toString("base64");
            resolve({ url: `data:${mimeType};base64,${base64}` });
          } else {
            resolve({ url: result!.secure_url });
          }
        }
      ).end(buffer);
    });
  } catch (err: any) {
    console.error("Erro geral no upload para Cloudinary, usando fallback Base64:", err);
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      return { url: `data:${mimeType};base64,${base64}` };
    } catch (fallbackErr: any) {
      return { error: err.message || "Erro desconhecido durante o upload." };
    }
  }
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
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const categoryId = formData.get("category") as string; // Agora recebemos o ID ou o nome
  
  const latStr = formData.get("lat") as string;
  const lngStr = formData.get("lng") as string;
  const lat = latStr && !isNaN(parseFloat(latStr)) ? parseFloat(latStr) : null;
  const lng = lngStr && !isNaN(parseFloat(lngStr)) ? parseFloat(lngStr) : null;

  if (!url) return { error: "A imagem é obrigatória" };
  if (!title) return { error: "O título é obrigatório" };
  if (!categoryId) return { error: "A categoria é obrigatória" };

  try {
    // Tentar encontrar a categoria pelo ID primeiro, se falhar tenta pelo nome
    // Para simplificar, vamos assumir que o painel envia o nome selecionado
    const categoryRecord = await prisma.category.findFirst({
      where: { 
        OR: [
          { id: categoryId },
          { name: categoryId }
        ]
      }
    });

    await prisma.photo.create({
      data: { 
        url, 
        title, 
        description: description || null,
        location: location || null, 
        category: categoryRecord?.name || categoryId, 
        lat, 
        lng,
        categoryId: categoryRecord?.id || null
      },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar no banco de dados", error);
    return { error: error.message || "Erro ao salvar no banco de dados" };
  }
}

export async function updatePhoto(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const categoryId = formData.get("category") as string;

  const latStr = formData.get("lat") as string;
  const lngStr = formData.get("lng") as string;
  const lat = latStr && !isNaN(parseFloat(latStr)) ? parseFloat(latStr) : null;
  const lng = lngStr && !isNaN(parseFloat(lngStr)) ? parseFloat(lngStr) : null;

  if (!id) return { error: "O ID da foto é obrigatório" };
  if (!title) return { error: "O título é obrigatório" };
  if (!categoryId) return { error: "A categoria é obrigatória" };

  try {
    const categoryRecord = await prisma.category.findFirst({
      where: { 
        OR: [
          { id: categoryId },
          { name: categoryId }
        ]
      }
    });

    await prisma.photo.update({
      where: { id },
      data: { 
        title, 
        description: description || null,
        location: location || null, 
        category: categoryRecord?.name || categoryId, 
        lat, 
        lng,
        categoryId: categoryRecord?.id || null
      },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar foto", error);
    return { error: error.message || "Erro ao atualizar foto" };
  }
}

export async function deletePhoto(id: string) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      return { error: "Obra não encontrada" };
    }
    
    let deletedFromCloud = false;
    if (photo.url) {
      deletedFromCloud = await deleteFromCloudinary(photo.url);
    }
    
    await prisma.photo.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, deletedFromCloud };
  } catch (error: any) {
    console.error("Erro ao deletar foto", error);
    return { error: error.message || "Erro ao deletar foto" };
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

  if (!image) return { error: "A imagem de capa é obrigatória" };
  if (!title) return { error: "O título é obrigatório" };
  if (!excerpt) return { error: "O resumo é obrigatório" };
  if (!content) return { error: "O conteúdo é obrigatório" };

  try {
    await prisma.post.create({
      data: { title, excerpt, content, image },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar post no banco de dados", error);
    return { error: error.message || "Erro ao salvar post no banco de dados" };
  }
}

export async function deletePost(id: string) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (post?.image) {
      await deleteFromCloudinary(post.image);
    }
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
      content["footer_cta_title"] = footerConfig.ctaTitle || "Interessado em apoiar uma expedição?";
      content["footer_cta_desc"] = footerConfig.ctaDesc || "Estou sempre em busca de parceiros para patrocinar novas jornadas.";
      content["footer_copyright"] = footerConfig.copyright || "Diogo Alves. Todos os direitos reservados.";
      content["footer_tagline"] = footerConfig.tagline || "SÃO PAULO | TOKYO | ZURICH";
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
    } else {
      content["footer_cta_title"] = "Interessado em apoiar uma expedição?";
      content["footer_cta_desc"] = "Estou sempre em busca de parceiros para patrocinar novas jornadas.";
      content["footer_copyright"] = "Diogo Alves. Todos os direitos reservados.";
      content["footer_tagline"] = "SÃO PAULO | TOKYO | ZURICH";
    }

    if (homeConfig) {
      content["home_hero_title_1"] = homeConfig.title1 || "Diogo";
      content["home_hero_title_2"] = homeConfig.title2 || "Alves";
      content["home_hero_subtitle"] = homeConfig.subtitle || "Fotógrafo de Paisagens & Vida";
      content["home_hero_bg_url"] = homeConfig.heroBgUrl || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000";
      content["home_hero_main_text"] = homeConfig.mainText || "Capturando a essência do cotidiano em luz e cor.";
      content["home_gallery_title"] = homeConfig.galleryTitle || "Galeria em Foco";
      content["home_blog_title"] = homeConfig.blogTitle || "Últimas Histórias";
    } else {
      content["home_hero_title_1"] = "Diogo";
      content["home_hero_title_2"] = "Alves";
      content["home_hero_subtitle"] = "Fotógrafo de Paisagens & Vida";
      content["home_hero_bg_url"] = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000";
      content["home_hero_main_text"] = "Capturando a essência do cotidiano em luz e cor.";
      content["home_gallery_title"] = "Galeria em Foco";
      content["home_blog_title"] = "Últimas Histórias";
    }

    if (aboutConfig) {
      content["about_greeting"] = aboutConfig.greeting || "Olá, eu sou o Diogo";
      content["about_title_normal"] = aboutConfig.titleNormal || "Um curioso por natureza,";
      content["about_title_styled"] = aboutConfig.titleStyled || "apaixonado por café";
      content["about_bio"] = aboutConfig.bio || "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar.";
      content["about_years"] = aboutConfig.years || "10+";
      content["about_equipment"] = aboutConfig.equipment || "Leica M11 & Sony A7R V\n35mm Fixed Lens focus";
      content["about_address"] = aboutConfig.address || "São Paulo, Brasil\nDisponível para projetos globais";
      content["about_link_text"] = aboutConfig.linkText || "Minha história completa";
      content["about_photo_url"] = aboutConfig.photoUrl !== null ? aboutConfig.photoUrl : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";

      // Separated fields for Homepage
      content["about_home_greeting"] = aboutConfig.homeGreeting || aboutConfig.greeting || "Olá, eu sou o Diogo";
      content["about_home_title_normal"] = aboutConfig.homeTitleNormal || aboutConfig.titleNormal || "Um curioso por natureza,";
      content["about_home_title_styled"] = aboutConfig.homeTitleStyled || aboutConfig.titleStyled || "apaixonado por café";
      content["about_home_bio"] = aboutConfig.homeBio || aboutConfig.bio || "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar.";
      content["about_home_photo_url"] = aboutConfig.homePhotoUrl !== null ? aboutConfig.homePhotoUrl : (aboutConfig.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800");
      content["about_home_link_text"] = aboutConfig.homeLinkText || aboutConfig.linkText || "Minha história completa";

      // Separated fields for Full About Page
      content["about_page_title"] = aboutConfig.pageTitle || `Sobre ${aboutConfig.titleStyled || "Diogo Alves"}`;
      content["about_page_subtitle"] = aboutConfig.pageSubtitle || aboutConfig.titleNormal || "A busca pelo invisível.";
      content["about_page_bio"] = aboutConfig.pageBio || "Minha jornada na fotografia começou nas ruas de São Paulo, capturando a geometria brutalista e a humanidade vibrante da metrópole. Com o tempo, meu olhar se voltou para o silêncio — das paisagens remotas da Islândia à paciência necessária para observar a vida selvagem no Quênia. \n\nAcredito que uma boa fotografia não apenas documenta um moment, mas traduz o sentimento que ele evoca. Meu trabalho é minimalista por escolha, focado na pureza da colagem e na honestidade da luz.";
      content["about_page_photo_url"] = aboutConfig.pagePhotoUrl !== null ? aboutConfig.pagePhotoUrl : (aboutConfig.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000");
      content["about_page_years"] = aboutConfig.pageYears || aboutConfig.years || "10+";
      content["about_page_equipment"] = aboutConfig.pageEquipment || aboutConfig.equipment || "Leica M11 & Sony A7R V\n35mm Fixed Lens focus";
      content["about_page_address"] = aboutConfig.pageAddress || aboutConfig.address || "São Paulo, Brasil\nDisponível para projetos globais";
      content["about_page_awards"] = aboutConfig.pageAwards || "• National Geographic Photo of the Year (Finalist 2021)\n• International Photography Awards (Gold - Nature 2022)\n• Exhibition \"Urban Silence\" - Tokyo, Japan";
    } else {
      content["about_greeting"] = "Olá, eu sou o Diogo";
      content["about_title_normal"] = "Um curioso por natureza,";
      content["about_title_styled"] = "apaixonado por café";
      content["about_bio"] = "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar.";
      content["about_years"] = "10+";
      content["about_equipment"] = "Leica M11 & Sony A7R V\n35mm Fixed Lens focus";
      content["about_address"] = "São Paulo, Brasil\nDisponível para projetos globais";
      content["about_link_text"] = "Minha história completa";
      content["about_photo_url"] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";

      content["about_home_greeting"] = "Olá, eu sou o Diogo";
      content["about_home_title_normal"] = "Um curioso por natureza,";
      content["about_home_title_styled"] = "apaixonado por café";
      content["about_home_bio"] = "Paulistano de alma, encontro paz em caminhadas matinais e na luz que banha as ruas antes da cidade acordar. Sempre com um livro ou uma câmera por perto, busco a beleza no ordinário e nas histórias que as pessoas esquecem de contar.";
      content["about_home_photo_url"] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
      content["about_home_link_text"] = "Minha história completa";

      content["about_page_title"] = "Sobre Diogo Alves";
      content["about_page_subtitle"] = "A busca pelo invisível.";
      content["about_page_bio"] = "Minha jornada na fotografia começou nas ruas de São Paulo, capturando a geometria brutalista e a humanidade vibrante da metrópole. Com o tempo, meu olhar se voltou para o silêncio — das paisagens remotas da Islândia à paciência necessária para observar a vida selvagem no Quênia. \n\nAcredito que uma boa fotografia não apenas documenta um momento, mas traduz o sentimento que ele evoca. Meu trabalho é minimalista por escolha, focado na pureza da colagem e na honestidade da luz.";
      content["about_page_photo_url"] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000";
      content["about_page_years"] = "10+";
      content["about_page_equipment"] = "Leica M11 & Sony A7R V\n35mm Fixed Lens focus";
      content["about_page_address"] = "São Paulo, Brasil\nDisponível para projetos globais";
      content["about_page_awards"] = "• National Geographic Photo of the Year (Finalist 2021)\n• International Photography Awards (Gold - Nature 2022)\n• Exhibition \"Urban Silence\" - Tokyo, Japan";
    }

    if (contactConfig) {
      content["contact_title_normal"] = contactConfig.titleNormal || "Vamos";
      content["contact_title_styled"] = contactConfig.titleStyled || "conversar";
      content["contact_subtitle"] = contactConfig.subtitle || "Aberto a patrocínios para expedições e projetos autorais";
      content["contact_info_title"] = contactConfig.infoTitle || "Informações Diretas";
      content["contact_info_desc"] = contactConfig.infoDesc || "Se você tem interesse em patrocinar uma expedição, adquirir obras originais ou propor um projeto fotográfico, sinta-se à vontade para entrar em contato.";
      content["contact_email"] = contactConfig.email || "contato@diogoalves.com";
    } else {
      content["contact_title_normal"] = "Vamos";
      content["contact_title_styled"] = "conversar";
      content["contact_subtitle"] = "Aberto a patrocínios para expedições e projetos autorais";
      content["contact_info_title"] = "Informações Diretas";
      content["contact_info_desc"] = "Se você tem interesse em patrocinar uma expedição, adquirir obras originais ou propor um projeto fotográfico, sinta-se à vontade para entrar em contato.";
      content["contact_email"] = "contato@diogoalves.com";
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
    "home_hero_title_1": "title1",
    "home_hero_title_2": "title2",
    "home_hero_subtitle": "subtitle",
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
    "about_photo_url": "photoUrl",

    // Separated Homepage fields
    "about_home_greeting": "homeGreeting",
    "about_home_title_normal": "homeTitleNormal",
    "about_home_title_styled": "homeTitleStyled",
    "about_home_bio": "homeBio",
    "about_home_photo_url": "homePhotoUrl",
    "about_home_link_text": "homeLinkText",

    // Separated Full About Page fields
    "about_page_title": "pageTitle",
    "about_page_subtitle": "pageSubtitle",
    "about_page_bio": "pageBio",
    "about_page_photo_url": "pagePhotoUrl",
    "about_page_years": "pageYears",
    "about_page_equipment": "pageEquipment",
    "about_page_address": "pageAddress",
    "about_page_awards": "pageAwards"
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

  // Fetch old config to check if any images were updated or cleared
  try {
    const [oldHome, oldAbout] = await Promise.all([
      prisma.homeConfig.findUnique({ where: { id: "default" } }),
      prisma.aboutConfig.findUnique({ where: { id: "default" } }),
    ]);

    if (oldHome) {
      if (homeFields.heroBgUrl !== undefined && oldHome.heroBgUrl && oldHome.heroBgUrl !== homeFields.heroBgUrl) {
        await deleteFromCloudinary(oldHome.heroBgUrl);
      }
    }

    if (oldAbout) {
      if (aboutFields.photoUrl !== undefined && oldAbout.photoUrl && oldAbout.photoUrl !== aboutFields.photoUrl) {
        await deleteFromCloudinary(oldAbout.photoUrl);
      }
      if (aboutFields.homePhotoUrl !== undefined && oldAbout.homePhotoUrl && oldAbout.homePhotoUrl !== aboutFields.homePhotoUrl) {
        await deleteFromCloudinary(oldAbout.homePhotoUrl);
      }
      if (aboutFields.pagePhotoUrl !== undefined && oldAbout.pagePhotoUrl && oldAbout.pagePhotoUrl !== aboutFields.pagePhotoUrl) {
        await deleteFromCloudinary(oldAbout.pagePhotoUrl);
      }
    }
  } catch (err) {
    console.error("Erro ao limpar imagens antigas do Cloudinary:", err);
  }

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

function validateUserData(name: string, email: string, password?: string, role?: string) {
  if (!name || name.trim().length < 3) {
    return "O nome deve ter pelo menos 3 caracteres.";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return "O endereço de e-mail fornecido não é válido.";
  }
  
  if (password !== undefined) {
    if (!password || password.length < 6) {
      return "A senha deve conter pelo menos 6 caracteres.";
    }
  }
  
  if (role !== undefined && role !== "ADMIN" && role !== "EDITOR") {
    return "O cargo/nível selecionado é inválido. Escolha 'ADMIN' ou 'EDITOR'.";
  }
  
  return null;
}

export async function addUser(formData: FormData) {
  try {
    if (!(await isAdmin())) {
      return { error: "Acesso restrito. Você precisa ser um administrador para criar usuários." };
    }
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !password) {
      return { error: "Campos obrigatórios faltando. Preencha nome, e-mail e senha." };
    }

    const validationError = validateUserData(name, email, password, role);
    if (validationError) {
      return { error: validationError };
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado para outro usuário." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase().trim(), 
        password: hashedPassword, 
        role 
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return { error: error.message || "Erro desconhecido ao cadastrar usuário." };
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    if (!(await isAdmin())) {
      return { error: "Acesso restrito. Você precisa ser um administrador para editar usuários." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email) {
      return { error: "Campos obrigatórios faltando. Nome e e-mail são obrigatórios." };
    }

    const validationError = validateUserData(
      name, 
      email, 
      password ? password : undefined, 
      role
    );
    
    if (validationError) {
      return { error: validationError };
    }

    // Verificar se o e-mail já está em uso por outro usuário
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        id: { not: id }
      }
    });

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado para outro usuário." };
    }

    const updateData: any = {
      name,
      email: email.toLowerCase().trim(),
      role
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return { error: error.message || "Erro desconhecido ao atualizar usuário." };
  }
}

export async function deleteUser(id: string) {
  if (!(await isAdmin())) throw new Error("Acesso restrito");
  
  // Não permitir deletar a si mesmo por segurança
  const currentUser = await getLoggedInUser();
  if (currentUser?.id === id) throw new Error("Você não pode deletar sua própria conta");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

// ---- ACÕES DE CATEGORIA ----

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export async function addCategory(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  const name = formData.get("name") as string;
  if (!name) throw new Error("O nome da categoria é obrigatório");

  try {
    await prisma.category.create({
      data: { name }
    });
    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("Já existe uma categoria com este nome");
    }
    throw error;
  }
}

export async function deleteCategory(id: string) {
  if (!(await isAuthenticated())) throw new Error("Não autorizado");
  
  try {
    // Verificar se existem fotos vinculadas (opcional, ou podemos apenas desvincular)
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    throw new Error("Erro ao deletar categoria. Verifique se existem fotos vinculadas.");
  }
}
