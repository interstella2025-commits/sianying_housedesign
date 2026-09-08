import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  getSupabasePublishableKey,
  getSupabaseTenantEmail,
  getSupabaseTenantId,
  getSupabaseTenantPassword,
  getSupabaseUrl,
  isSupabaseTenantConfigured,
} from "@/lib/supabase/env";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

let tenantClientPromise: Promise<SupabaseClient> | null = null;
let tenantSessionExpiresAt = 0;

function createLowPrivilegeClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function signInTenantClient() {
  const client = createLowPrivilegeClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: getSupabaseTenantEmail(),
    password: getSupabaseTenantPassword(),
  });

  if (error || !data.session) {
    throw new Error(`Supabase 租戶登入失敗：${error?.message ?? "沒有工作階段"}`);
  }

  const expectedTenant = getSupabaseTenantId();
  const actualTenant = data.user.app_metadata?.tenant_id;
  if (actualTenant !== expectedTenant) {
    await client.auth.signOut();
    throw new Error("Supabase 租戶帳號與網站識別不一致");
  }

  tenantSessionExpiresAt = (data.session.expires_at ?? 0) * 1000;
  return client;
}

export async function createSupabaseTenantClient() {
  if (!isSupabaseTenantConfigured()) {
    throw new Error("Supabase 租戶連線尚未設定");
  }

  if (!tenantClientPromise || Date.now() >= tenantSessionExpiresAt - 60_000) {
    tenantClientPromise = signInTenantClient().catch((error) => {
      tenantClientPromise = null;
      tenantSessionExpiresAt = 0;
      throw error;
    });
  }

  return tenantClientPromise!;
}
