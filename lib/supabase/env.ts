function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

export function getSupabaseUrl() {
  return readEnv("SUPABASE_URL");
}

/** Low-privilege key. Database access is constrained by grants and Row Level Security. */
export function getSupabasePublishableKey() {
  return readEnv("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY");
}

export function getSupabaseTenantId() {
  return readEnv("SUPABASE_TENANT_ID");
}

export function getSupabaseTenantEmail() {
  return readEnv("SUPABASE_TENANT_EMAIL");
}

export function getSupabaseTenantPassword() {
  return readEnv("SUPABASE_TENANT_PASSWORD");
}

export function isSupabaseTenantConfigured() {
  return Boolean(
    getSupabaseUrl() &&
      getSupabasePublishableKey() &&
      getSupabaseTenantId() &&
      getSupabaseTenantEmail() &&
      getSupabaseTenantPassword(),
  );
}
