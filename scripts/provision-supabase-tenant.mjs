import { createClient } from "@supabase/supabase-js";

function required(name, aliases = []) {
  for (const key of [name, ...aliases]) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(`缺少環境變數：${name}`);
}

const supabaseUrl = required("SUPABASE_URL");
const secretKey = required("SUPABASE_SECRET_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);
const tenantId = required("TENANT_ID");
const tenantName = required("TENANT_NAME");
const tenantEmail = required("TENANT_EMAIL").toLowerCase();
const tenantPassword = required("TENANT_PASSWORD");
const tablePrefix = process.env.TABLE_PREFIX?.trim() ?? `${tenantId}_`;
const uploadBucket = process.env.UPLOAD_BUCKET?.trim() ?? `${tenantId}-uploads`;

if (!/^[a-z0-9][a-z0-9-]{1,47}$/.test(tenantId)) {
  throw new Error("TENANT_ID 只能使用 2–48 個小寫英數字或連字號");
}
if (tenantPassword.length < 24) {
  throw new Error("TENANT_PASSWORD 至少需要 24 個字元");
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function findUserByEmail(email) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
}

let user = await findUserByEmail(tenantEmail);
let created = false;

if (user) {
  const { data, error } = await admin.auth.admin.updateUserById(user.id, {
    password: tenantPassword,
    app_metadata: {
      ...user.app_metadata,
      tenant_id: tenantId,
      account_kind: "website_service",
    },
  });
  if (error) throw error;
  user = data.user;
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: tenantEmail,
    password: tenantPassword,
    email_confirm: true,
    app_metadata: {
      tenant_id: tenantId,
      account_kind: "website_service",
    },
  });
  if (error) throw error;
  user = data.user;
  created = true;
}

const { error: tenantError } = await admin.from("design_tenants").upsert(
  {
    id: tenantId,
    display_name: tenantName,
    table_prefix: tablePrefix,
    upload_bucket: uploadBucket,
    active: true,
  },
  { onConflict: "id" },
);
if (tenantError) throw tenantError;

const { error: membershipError } = await admin
  .from("design_tenant_memberships")
  .upsert(
    { tenant_id: tenantId, user_id: user.id, role: "website" },
    { onConflict: "tenant_id,user_id" },
  );
if (membershipError) throw membershipError;

process.stdout.write(
  `${JSON.stringify({ tenantId, userId: user.id, email: tenantEmail, created })}\n`,
);
