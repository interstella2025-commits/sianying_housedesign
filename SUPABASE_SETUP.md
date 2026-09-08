# 翔胤 Supabase 接入

本網站共用 `howie_housedesign` Supabase 專案，但使用獨立租戶邊界：

- Tenant ID：`sianying`
- 資料表前綴：`sianying_`
- 諮詢資料表：`sianying_inquiries`
- Storage bucket：`sianying-uploads`
- 網站服務帳號：`site-sianying@shared-db.example`

## 一次性資料庫設定

1. 在 `howie_housedesign` 的 SQL Editor 執行：
   `supabase/migrations/20260908160000_sianying_tenant.sql`
2. 由平台管理員在受控電腦使用主控密鑰執行 `npm run tenant:provision`。
3. 執行 `npm run tenant:verify`，確認翔胤帳號只能看到翔胤資料表與 bucket。

主控 `SUPABASE_SECRET_KEY` 僅可在步驟 2 暫時使用，執行後立即移除。

## Vercel 環境變數

Production 與 Preview 手動加入 `.env.example` 列出的五個低權限變數。不得使用 Vercel
Supabase Integration 自動注入，也不得加入 service role、secret、Postgres URL、資料庫密碼或
JWT secret。

網站的 `/api/inquiries` 會在伺服器端以翔胤專屬帳號登入，驗證 `tenant_id` 後才寫入
`sianying_inquiries`。公開表單不會收到服務帳號密碼。
