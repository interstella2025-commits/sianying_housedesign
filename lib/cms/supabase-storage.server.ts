import "server-only";

import { createSupabaseTenantClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function readSupabaseCmsJson<T>(key: string): Promise<T | null> {
  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase
    .from("sianying_cms_documents")
    .select("data")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.data as T | undefined) ?? null;
}

export async function writeSupabaseCmsJson<T>(key: string, data: T): Promise<void> {
  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase.from("sianying_cms_documents").upsert(
    {
      key,
      data: data as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
