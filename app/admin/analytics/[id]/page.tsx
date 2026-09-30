import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth.server";
import { durationLabel, sessionDurationSeconds, sourceLabel, type AnalyticsEvent, type AnalyticsSession } from "@/lib/analytics/report";
import { createSupabaseTenantClient } from "@/lib/supabase/server";

const eventLabels: Record<string, string> = {
  page_view: "進入頁面",
  section_view: "看見段落",
  scroll_depth: "閱讀深度",
  consultation_click: "點擊免費會勘",
  line_click: "點擊 LINE",
  phone_click: "點擊電話",
  form_start: "開始填寫表單",
  form_success: "成功送出會勘",
  session_end: "離開網站",
};

function eventDetail(event: AnalyticsEvent) {
  const data = event.event_data && typeof event.event_data === "object" && !Array.isArray(event.event_data)
    ? event.event_data
    : {};
  if (event.event_name === "section_view") return event.section_id || "未命名段落";
  if (event.event_name === "scroll_depth") return `${data.depth || 0}%`;
  if (event.event_name === "session_end") return durationLabel(Number(data.durationSeconds || 0));
  if (event.event_name === "form_success") return "已寫入網站詢問名單";
  return event.page_path;
}

export default async function AnalyticsVisitorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const supabase = await createSupabaseTenantClient();
  const [sessionResult, eventsResult] = await Promise.all([
    supabase.from("sianying_web_sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("sianying_web_events").select("*").eq("session_id", id).order("occurred_at", { ascending: true }).limit(500),
  ]);
  if (!sessionResult.data || sessionResult.error) notFound();
  const session = sessionResult.data as AnalyticsSession;
  const events = (eventsResult.data || []) as AnalyticsEvent[];
  const attribution = [
    ["來源", sourceLabel(session)],
    ["活動", session.utm_campaign || "—"],
    ["關鍵字", session.utm_term || "—"],
    ["廣告內容", session.utm_content || "—"],
    ["Campaign ID", session.campaign_id || "—"],
    ["Ad group ID", session.ad_group_id || "—"],
    ["Ad ID", session.ad_id || "—"],
    ["GCLID", session.gclid ? "已取得" : "—"],
  ];

  return (
    <div className="admin-page admin-page-wide analytics-page">
      <header className="admin-header analytics-header">
        <div>
          <p className="admin-note"><Link href="/admin/analytics">← 返回流量分析</Link></p>
          <h1>{session.visitor_key}</h1>
          <p className="admin-note">匿名訪客行為時間線，不保存原始 IP。</p>
        </div>
        <AdminLogoutButton />
      </header>

      <section className="analytics-kpis analytics-kpis-detail">
        <article><span>來源</span><strong>{sourceLabel(session)}</strong><small>{session.landing_path}</small></article>
        <article><span>裝置</span><strong>{session.device_type}</strong><small>{session.viewport_width || "—"} px</small></article>
        <article><span>閱讀深度</span><strong>{session.max_scroll_depth}%</strong><small>最高捲動位置</small></article>
        <article><span>停留時間</span><strong>{durationLabel(sessionDurationSeconds(session))}</strong><small>方向性指標</small></article>
        <article className={session.converted_inquiry_id ? "is-primary" : ""}><span>會勘轉換</span><strong>{session.converted_inquiry_id ? "已送出" : "未送出"}</strong><small>{session.last_stage || "page_view"}</small></article>
      </section>

      <div className="analytics-grid analytics-detail-grid">
        <section className="analytics-panel">
          <header><div><span>歸因資料</span><h2>這次造訪從哪裡來</h2></div></header>
          <dl className="analytics-attribution-list">
            {attribution.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </section>
        <section className="analytics-panel analytics-panel-wide">
          <header><div><span>完整旅程</span><h2>{events.length} 個網站行為</h2></div></header>
          <ol className="analytics-timeline">
            {events.map((event) => (
              <li key={event.id}>
                <time>{new Date(event.occurred_at).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
                <div><strong>{eventLabels[event.event_name] || event.event_name}</strong><span>{eventDetail(event)}</span></div>
              </li>
            ))}
            {!events.length ? <li><div><strong>尚無事件</strong><span>這筆工作階段只有基本資料。</span></div></li> : null}
          </ol>
        </section>
      </div>
    </div>
  );
}
