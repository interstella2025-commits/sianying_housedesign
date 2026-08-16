# 翔胤室內設計網站重製

這是一份可直接交給 Cursor 繼續開發的完整網站原始碼。內容與資訊架構取自翔胤舊站，視覺與動態已重新設計為冷灰底板、全幅影像首屏、圓角挖空、非對稱編排與手機優先的版本。

## 開始使用

```bash
npm install
npm run dev
```

瀏覽器開啟 http://localhost:3000 即可預覽。

正式建置：

```bash
npm run build
npm run start
```

若需部署至 Cloudflare Workers，請改用 `npm run dev:cf`、`npm run build:cf` 與 `npm run start:cf`。

## 保留的舊站網址

- `/`：首屏、作品堆疊與相簿、聯絡資訊、線上預約丈量
- `/awards`：國際獎項
- `/services`：設計及收費
- `/about`：關於我們
- `/privacy`：隱私權政策

請保留以上路徑，避免正式換站時影響既有連結與搜尋結果。

## 動態設計

- 首屏導覽、H1 與全幅影像整合為同一個鑲嵌式畫面
- 首屏文字與影像遮罩依序展開
- 前四件作品採用 GSAP ScrollTrigger 捲動堆疊，手機版自動回到自然單欄
- 後八件作品採不對稱網格，點擊後開啟完整相簿與設計說明
- 12 件作品資料保留於 `app/data.ts`，完整相簿素材位於 `public/images/projects/`
- 圖片視差與內容進場皆只動畫 `transform`、`opacity` 或 `clip-path`
- 完整支援 `prefers-reduced-motion`

## 表單說明

目前未提供新的表單後端，因此首頁預約表單會將填寫內容複製到剪貼簿，再開啟翔胤 LINE 對話。若日後接入 CRM、Email API 或自有後端，可從 `app/components/ReservationForm.tsx` 的 `handleSubmit` 開始替換，欄位名稱保留自舊站。

## 主要檔案

- `app/page.tsx`：首頁
- `app/data.ts`：導覽、作品、流程與聯絡資料
- `app/globals.css`：完整設計系統與手機版排版
- `app/components/MotionDirector.tsx`：全站動態編排
- `app/components/ProjectPresentation.tsx`：作品堆疊、網格與相簿
- `public/projects/`：十二件作品素材
- `public/images/projects/`：十二件作品完整相簿素材
- `public/media/`：品牌、人物、獎項與影片素材
- `public/og.png`：LINE、Facebook 等平台的分享預覽圖

## 上線前建議

- 確認電話、地址、Email、公司統編與各社群連結
- 決定是否改接正式表單後端
- 在正式網域設定分析工具與廣告 Cookie 同意機制
- 上線後提交 sitemap 並確認所有舊網址均正常回應
