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

const ownTables = {
  sianying_inquiries:
    "id,created_at,form_type,name,phone,email,house_age,location,budget,project_type,message,line_id,source_path,visitor_hash,status",
  sianying_cms_documents: "key,data,updated_at",
  sianying_bk_projects:
    "id,name,client_name,client_phone,client_tax_id,client_invoice_tax_mode,client_invoice_no,design_invoice_tax_mode,design_invoice_no,prepayment_invoice_tax_mode,prepayment_invoice_no,address,design_fee_amount,prepayment_amount,contract_amount,status,note,created_at,updated_at",
  sianying_bk_vendors:
    "id,name,trade,contact_name,phone,tax_id,bank_info,note,created_at,updated_at",
  sianying_bk_project_incomes:
    "id,project_id,received_date,income_category,amount,payment_method,reference_no,invoice_tax_mode,client_invoice_status,client_invoice_no,tax_status,tax_amount,tax_paid_date,note,created_at",
  sianying_bk_project_expenses:
    "id,project_id,vendor_id,expense_date,trade,description,payable_amount,payable_net_amount,due_date,payment_stage,invoice_no,invoice_amount,vendor_tax_mode,vendor_invoice_status,vendor_invoice_note,note,created_at,updated_at",
  sianying_bk_expense_payments:
    "id,expense_id,paid_date,amount,payment_method,reference_no,note,created_at",
};

const ownCounts = {};
for (const [table, columns] of Object.entries(ownTables)) {
  const result = await tenant.from(table).select(columns, { count: "exact", head: true });
  assert.equal(result.error, null, `${table}: ${result.error?.message}`);
  ownCounts[table] = result.count ?? 0;
}

const anonTable = await anonymous
  .from("sianying_inquiries")
  .select("id", { count: "exact", head: true });
assert.ok(anonTable.error || anonTable.count === 0, "匿名帳號不應讀取翔胤詢問資料");

for (const foreignTable of [
  "cms_documents",
  "bk_projects",
  "bk_vendors",
  "bk_project_incomes",
  "bk_project_expenses",
  "bk_expense_payments",
  "yanyi_cms_documents",
  "yanyi_bk_projects",
  "yanyi_bk_vendors",
]) {
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
    ownCounts,
    isolation: "verified",
  })}\n`,
);
