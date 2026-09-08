import assert from "node:assert/strict";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少環境變數：${name}`);
  return value;
}

const baseUrl = (process.env.ADMIN_SMOKE_BASE_URL || "http://localhost:3099").replace(/\/$/, "");
const password = required("ADMIN_PASSWORD");

const denied = await fetch(`${baseUrl}/api/projects`);
assert.equal(denied.status, 401, "未登入時作品 API 必須拒絕存取");

const login = await fetch(`${baseUrl}/api/admin/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, `後台登入失敗：${await login.text()}`);

const setCookie = login.headers.get("set-cookie");
assert.ok(setCookie, "登入成功後沒有收到工作階段 Cookie");
const cookie = setCookie.split(";", 1)[0];

async function getJson(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { cookie },
  });
  const payload = await response.json();
  assert.equal(response.status, 200, `${pathname}: ${JSON.stringify(payload)}`);
  return payload;
}

const projects = await getJson("/api/projects");
assert.ok(Array.isArray(projects.projects) && projects.projects.length >= 12, "作品資料未完整載入");

const page = await getJson("/api/puck?path=%2F");
assert.ok(Array.isArray(page.data?.content) && page.data.content.length > 0, "Puck 首頁資料未載入");

const bookkeeping = await getJson("/api/bookkeeping/projects");
assert.ok(Array.isArray(bookkeeping.projects), "記帳專案 API 格式不正確");

const inquiries = await getJson("/api/admin/inquiries");
assert.ok(Array.isArray(inquiries.inquiries), "詢問單 API 格式不正確");

process.stdout.write(`${JSON.stringify({
  ok: true,
  projectCount: projects.projects.length,
  bookkeepingProjectCount: bookkeeping.projects.length,
  inquiryCount: inquiries.inquiries.length,
})}\n`);
