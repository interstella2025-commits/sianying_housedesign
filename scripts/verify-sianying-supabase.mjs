import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少環境變數：${name}`);
  return value;
}

const url = required("SUPABASE_URL");
const publishableKey = required("SUPABASE_PUBLISHABLE_KEY");
const tenantId = required("SUPABASE_TENANT_ID");
const email = required("SUPABASE_TENANT_EMAIL");
const password = required("SUPABASE_TENANT_PASSWORD");

function client() {
  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

const anonymous = client();
const tenant = client();
const { data: sessionData, error: signInError } = await tenant.auth.signInWithPassword({
  email,
  password,
});

if (signInError || !sessionData.user) {
  throw new Error(`翔胤租戶登入失敗：${signInError?.message ?? "沒有使用者"}`);
}
assert.equal(sessionData.user.app_metadata?.tenant_id, tenantId);

const ownTable = await tenant
  .from("sianying_inquiries")
  .select("id", { count: "exact", head: true });
assert.equal(ownTable.error, null, ownTable.error?.message);

const anonTable = await anonymous
  .from("sianying_inquiries")
  .select("id", { count: "exact", head: true });
assert.ok(anonTable.error || anonTable.count === 0, "匿名帳號不應讀取翔胤詢問資料");

for (const foreignTable of ["cms_documents", "yanyi_cms_documents"]) {
  const result = await tenant.from(foreignTable).select("*", { count: "exact", head: true });
  assert.ok(result.error || result.count === 0, `翔胤帳號不應讀取 ${foreignTable}`);
}

const ownBucket = await tenant.storage.from("sianying-uploads").list("", { limit: 1 });
assert.equal(ownBucket.error, null, ownBucket.error?.message);

for (const foreignBucket of ["howei-uploads", "yanyi-uploads"]) {
  const result = await tenant.storage.from(foreignBucket).list("", { limit: 1 });
  assert.ok(result.error || result.data.length === 0, `翔胤帳號不應列出 ${foreignBucket}`);
}

process.stdout.write(
  `${JSON.stringify({
    ok: true,
    tenantId,
    ownInquiryCount: ownTable.count ?? 0,
    isolation: "verified",
  })}\n`,
);
