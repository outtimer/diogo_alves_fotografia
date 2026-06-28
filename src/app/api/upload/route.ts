import { NextRequest, NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/app/admin/actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado. Por favor, faça login novamente." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinary = getCloudinary();
    if (!cloudinary) {
      console.log("Cloudinary não configurado. Verificando tamanho do arquivo.");
      // Limitar o fallback Base64 a arquivos menores que 1.5 MB para evitar estourar o limite de payload do banco Turso/LibSQL
      const limitBytes = 1.5 * 1024 * 1024;
      if (file.size > limitBytes) {
        return NextResponse.json({ 
          error: "Cloudinary não está configurado. Para enviar imagens maiores que 1.5MB, configure as variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET nas configurações." 
        }, { status: 400 });
      }

      const mimeType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      return NextResponse.json({ url: `data:${mimeType};base64,${base64}` });
    }

    const result = await new Promise<{ url?: string; error?: string }>((resolve) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "portfolio" },
        (error, result) => {
          if (error) {
            console.error("Erro no Cloudinary:", error);
            resolve({ error: `Erro no Cloudinary: ${error.message || JSON.stringify(error)}` });
          } else {
            resolve({ url: result!.secure_url });
          }
        }
      ).end(buffer);
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: err.message || "Erro desconhecido durante o upload." }, { status: 500 });
  }
}
