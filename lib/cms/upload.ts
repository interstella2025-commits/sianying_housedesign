import "server-only";

import fs from "fs/promises";
import path from "path";
import { createSupabaseTenantClient } from "@/lib/supabase/server";
import { isSupabaseTenantConfigured } from "@/lib/supabase/env";

const UPLOADS_DIR = path.join(process.cwd(), "public", "sianying", "uploads");
const SUPABASE_UPLOAD_BUCKET = "sianying-uploads";

function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

async function storeInSupabase(file: File, filename: string) {
  const supabase = await createSupabaseTenantClient();
  const body = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(SUPABASE_UPLOAD_BUCKET)
    .upload(filename, body, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new Error("找不到 sianying-uploads 儲存桶");
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(SUPABASE_UPLOAD_BUCKET).getPublicUrl(filename);
  return { url: data.publicUrl, filename, storage: "supabase" as const };
}

export async function storeUploadedFile(file: File) {
  const safeName = sanitizeFilename(file.name || "upload.bin") || "upload.bin";
  const filename = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  if (isSupabaseTenantConfigured()) return storeInSupabase(file, filename);
  if (process.env.VERCEL === "1") {
    throw new Error("正式環境的 Supabase 檔案儲存尚未設定");
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return {
    url: `/sianying/uploads/${filename}`,
    filename,
    storage: "local" as const,
  };
}

export function uploadStorageMode() {
  return isSupabaseTenantConfigured() ? "supabase" : "local";
}
