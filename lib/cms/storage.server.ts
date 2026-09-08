import "server-only";

import fs from "fs/promises";
import path from "path";
import { isSupabaseTenantConfigured } from "@/lib/supabase/env";

const CMS_DIR = path.join(process.cwd(), "data", "cms");

async function readLocal<T>(key: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(CMS_DIR, `${key}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeLocal<T>(key: string, data: T): Promise<void> {
  await fs.mkdir(CMS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CMS_DIR, `${key}.json`),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export async function readCmsJson<T>(key: string): Promise<T | null> {
  if (isSupabaseTenantConfigured()) {
    const { readSupabaseCmsJson } = await import("@/lib/cms/supabase-storage.server");
    return readSupabaseCmsJson<T>(key);
  }
  return readLocal<T>(key);
}

export async function writeCmsJson<T>(key: string, data: T): Promise<void> {
  if (isSupabaseTenantConfigured()) {
    const { writeSupabaseCmsJson } = await import("@/lib/cms/supabase-storage.server");
    return writeSupabaseCmsJson<T>(key, data);
  }
  if (process.env.VERCEL === "1") {
    throw new Error("正式環境的 Supabase 租戶連線尚未設定");
  }
  return writeLocal<T>(key, data);
}

export function cmsUsesSupabaseStorage() {
  return isSupabaseTenantConfigured();
}

export function cmsIsReadOnly() {
  return process.env.VERCEL === "1" && !isSupabaseTenantConfigured();
}
