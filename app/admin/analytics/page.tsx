import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { Breakdown, JourneyFunnel, TrafficTrend } from "@/components/admin/AnalyticsVisuals";
import { requireAdminPage } from "@/lib/admin-auth.server";
import {
  dateKey,
  durationLabel,
  eventSessionIds,
  isPaidGoogle,
  percent,
  sessionDurationSeconds,
  shortDate,
  sourceLabel,
  type AnalyticsEvent,
  type AnalyticsSession,
} from "@/lib/analytics/report";
import { createSupabaseTenantClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

function rangeDays(value?: string) {
  return value === "1" ? 1 : value === "90" ? 90 : value === "30" ? 30 : 7;
}

function rangeHref(days: number) {
  return `/admin/analytics?range=${days}`;
}

function reportClock() {
  return Date.now();
}

function countBy<T>(items: T[], label: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = label(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].map(([name, value]) => ({ label: name, value })).sort((a, b) => b.value - a.value);
}

function confidence(leads: number, linkedPaidLeads: number, paidLeads: number) {
  if (!leads) return { level: "尚未累積", tone: "low", text: "目前沒有會勘名單，先確認事件有正常進站，再等待實際轉換。" };
  const linkedRate = paidLeads ? linkedPaidLeads / paidLeads : 1;
  if (leads >= 15 && linkedRate >= 0.8) return { level: "高", tone: "high", text: "名單量與廣告歸因足以支持預算調整。" };
  if (leads >= 5 && linkedRate >= 0.5) return { level: "中", tone: "medium", text: "可判斷方向，但放大預算前仍應補足名單量與歸因。" };
  return { level: "低", tone: "low", text: "樣本或廣告歸因不足，暫時不要只看 CPA 做大幅預算調整。" };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const days = rangeDays(typeof params.range === "string" ? params.range : undefined);
  const now = reportClock();
  const since = new Date(now - days * 86_400_000).toISOString();
  type InquiryRow = Database["public"]["Tables"]["sianying_inquiries"]["Row"];
  let unavailable = false;
  let sessions: AnalyticsSession[] = [];
  let events: AnalyticsEvent[] = [];
  let inquiries: InquiryRow[] = [];
  try {
    const supabase = await createSupabaseTenantClient();
    const [sessionsResult, eventsResult, inquiriesResult] = await Promise.all([
      supabase.from("sianying_web_sessions").select("*").gte("started_at", since).order("started_at", { ascending: false }).limit(5000),
      supabase.from("sianying_web_events").select("*").gte("occurred_at", since).order("occurred_at", { ascending: false }).limit(20000),
      supabase.from("sianying_inquiries").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(1000),
    ]);
    unavailable = Boolean(sessionsResult.error || eventsResult.error || inquiriesResult.error);
    sessions = (sessionsResult.data || []) as AnalyticsSession[];
    events = (eventsResult.data || []) as AnalyticsEvent[];
    inquiries = inquiriesResult.data || [];
  } catch {
    unavailable = true;
  }

  const visitors = new Set(sessions.map((session) => session.visitor_id)).size;
  const paidSessions = sessions.filter(isPaidGoogle);
  const paidVisitors = new Set(paidSessions.map((session) => session.visitor_id)).size;
  const formSuccess = eventSessionIds(events, "form_success");
  const convertedSessions = new Set([
    ...sessions.filter((session) => session.converted_inquiry_id).map((session) => session.id),
    ...formSuccess,
  ]);
  const leads = inquiries.length || convertedSessions.size;
  const paidLeads = inquiries.filter((item) => Boolean(item.gclid) || /^(cpc|ppc|paid_search)$/i.test(item.utm_medium || ""));
  const linkedPaidLeads = paidLeads.filter((item) => item.analytics_session_id).length;
  const engagedSessions = new Set(sessions.filter((session) => session.max_scroll_depth >= 25).map((session) => session.id));
  events.filter((event) => !["page_view", "session_end"].includes(event.event_name)).forEach((event) => engagedSessions.add(event.session_id));
  const lineClicks = eventSessionIds(events, "line_click");
  const phoneClicks = eventSessionIds(events, "phone_click");
  const consultationClicks = eventSessionIds(events, "consultation_click");
  const formStarts = eventSessionIds(events, "form_start");
  const scroll50 = new Set(sessions.filter((session) => session.max_scroll_depth >= 50).map((session) => session.id));
  const averageDuration = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + sessionDurationSeconds(session), 0) / sessions.length)
    : 0;
  const trackingConfidence = confidence(leads, linkedPaidLeads, paidLeads.length);

  const dayKeys = Array.from({ length: days }, (_, index) => {
    const date = new Date(now - (days - index - 1) * 86_400_000);
    return dateKey(date.toISOString());
  });
  const leadDates = countBy(inquiries, (item) => dateKey(item.created_at));
  const leadDateMap = new Map(leadDates.map((item) => [item.label, item.value]));
  const sessionDates = countBy(sessions, (session) => dateKey(session.started_at));
  const sessionDateMap = new Map(sessionDates.map((item) => [item.label, item.value]));
  const trend = dayKeys.map((key) => ({
    label: shortDate(`${key}T12:00:00+08:00`),
    sessions: sessionDateMap.get(key) || 0,
    leads: leadDateMap.get(key) || 0,
  }));

  const sources = countBy(sessions, sourceLabel).slice(0, 6).map((item) => ({
    ...item,
    detail: `${percent(item.value, sessions.length)}%`,
  }));
  const devices = countBy(sessions, (session) => ({ mobile: "手機", desktop: "電腦", tablet: "平板", unknown: "其他" })[session.device_type]).map((item) => ({
    ...item,
    detail: `${percent(item.value, sessions.length)}%`,
  }));
  const sections = countBy(
    events.filter((event) => event.event_name === "section_view" && event.section_id),
    (event) => event.section_id || "其他",
  ).slice(0, 8);

  const campaigns = new Map<string, AnalyticsSession[]>();
  sessions.forEach((session) => {
    const key = session.utm_campaign || (isPaidGoogle(session) ? "未命名 Google Ads 活動" : sourceLabel(session));
    const rows = campaigns.get(key) || [];
    rows.push(session);
    campaigns.set(key, rows);
  });
  const campaignRows = [...campaigns.entries()].map(([name, rows]) => {
    const ids = new Set(rows.map((row) => row.id));
    const campaignLeads = [...convertedSessions].filter((id) => ids.has(id)).length;
    return {
      name,
      source: sourceLabel(rows[0]),
      sessions: rows.length,
      visitors: new Set(rows.map((row) => row.visitor_id)).size,
      leads: campaignLeads,
      rate: percent(campaignLeads, rows.length),
    };
  }).sort((a, b) => b.sessions - a.sessions).slice(0, 12);

  const funnel = [
    { label: "進入網站", value: sessions.length, rate: 100, note: "所有工作階段" },
    { label: "產生互動", value: engagedSessions.size, rate: percent(engagedSessions.size, sessions.length), note: "捲動或操作頁面" },
    { label: "閱讀超過一半", value: scroll50.size, rate: percent(scroll50.size, sessions.length), note: "到達 50% 深度" },
    { label: "點擊諮詢", value: new Set([...consultationClicks, ...lineClicks, ...phoneClicks]).size, rate: percent(new Set([...consultationClicks, ...lineClicks, ...phoneClicks]).size, sessions.length), note: "表單、LINE 或電話" },
    { label: "開始填表", value: formStarts.size, rate: percent(formStarts.size, sessions.length), note: "已操作欄位" },
    { label: "送出會勘", value: convertedSessions.size, rate: percent(convertedSessions.size, sessions.length), note: "資料庫確認成功" },
  ];

  return (
    <div className="admin-page admin-page-wide analytics-page">
      <header className="admin-header analytics-header">
        <div>
          <p className="admin-note"><Link href="/admin">← 返回後台</Link></p>
          <h1>廣告流量分析</h1>
          <p className="admin-note">從 Google Ads 點擊一路看到免費會勘名單，不把瀏覽量當成成交。</p>
        </div>
        <AdminLogoutButton />
      </header>

      <div className="analytics-toolbar">
        <div className="analytics-range" aria-label="統計期間">
          {[1, 7, 30, 90].map((range) => (
            <Link className={days === range ? "is-active" : ""} href={rangeHref(range)} key={range}>
              {range === 1 ? "24 小時" : `${range} 天`}
            </Link>
          ))}
        </div>
        <span>更新至 {new Date(now).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit" })}</span>
      </div>

      {unavailable ? (
        <section className="analytics-setup">
          <strong>分析資料表尚未啟用</strong>
          <p>程式已安裝完成；套用 Supabase migration 後，網站會開始累積第一方流量。</p>
        </section>
      ) : null}

      <section className="analytics-kpis" aria-label="核心成效">
        <article><span>不重複訪客</span><strong>{visitors.toLocaleString("zh-TW")}</strong><small>{sessions.length} 次工作階段</small></article>
        <article><span>Google Ads 訪客</span><strong>{paidVisitors.toLocaleString("zh-TW")}</strong><small>{percent(paidVisitors, visitors)}% 流量占比</small></article>
        <article><span>會勘名單</span><strong>{leads.toLocaleString("zh-TW")}</strong><small>{paidLeads.length} 筆來自付費搜尋</small></article>
        <article className="is-primary"><span>網站轉換率</span><strong>{percent(leads, sessions.length)}%</strong><small>名單 ÷ 工作階段</small></article>
        <article><span>平均停留</span><strong>{durationLabel(averageDuration)}</strong><small>{percent(engagedSessions.size, sessions.length)}% 有效互動</small></article>
      </section>

      <section className="analytics-confidence">
        <div><span>追蹤可信度</span><strong className={`is-${trackingConfidence.tone}`}>{trackingConfidence.level}</strong></div>
        <p>{trackingConfidence.text}</p>
        <div className="analytics-connection"><span className="is-connected" />網站行為已連線 <span className="is-pending" />Google Ads 花費待 API 憑證</div>
      </section>

      <details className="analytics-tracking-guide">
        <summary>Google Ads 網址追蹤設定</summary>
        <div>
          <p>開啟自動標記，並把這段設為「最終到達網址尾碼」，後台才能拆到活動、廣告群組、素材與關鍵字。</p>
          <code>utm_source=google&amp;utm_medium=cpc&amp;utm_campaign=&#123;campaignid&#125;&amp;utm_term=&#123;keyword&#125;&amp;utm_content=&#123;creative&#125;&amp;campaign_id=&#123;campaignid&#125;&amp;adgroup_id=&#123;adgroupid&#125;&amp;ad_id=&#123;creative&#125;</code>
        </div>
      </details>

      <div className="analytics-grid analytics-grid-hero">
        <section className="analytics-panel analytics-panel-wide">
          <header><div><span>流量趨勢</span><h2>每天來多少人、留下多少名單</h2></div><div className="analytics-legend"><i />工作階段 <i />詢問</div></header>
          <TrafficTrend points={trend} />
        </section>
        <section className="analytics-panel">
          <header><div><span>轉換入口</span><h2>客戶用哪種方式聯絡</h2></div></header>
          <div className="analytics-contact-stats">
            <div><strong>{lineClicks.size}</strong><span>LINE 點擊</span></div>
            <div><strong>{phoneClicks.size}</strong><span>電話點擊</span></div>
            <div><strong>{formStarts.size}</strong><span>開始填表</span></div>
            <div><strong>{convertedSessions.size}</strong><span>成功送出</span></div>
          </div>
        </section>
      </div>

      <section className="analytics-panel analytics-journey-panel">
        <header><div><span>訪客旅程</span><h2>廣告進站後，客戶在哪一步離開</h2></div><p>分母固定為工作階段，避免前後節點相減造成誤判。</p></header>
        <JourneyFunnel items={funnel} />
      </section>

      <div className="analytics-grid analytics-grid-thirds">
        <section className="analytics-panel"><header><div><span>來源</span><h2>流量從哪裡來</h2></div></header><Breakdown items={sources} /></section>
        <section className="analytics-panel"><header><div><span>裝置</span><h2>客戶用什麼瀏覽</h2></div></header><Breakdown items={devices} /></section>
        <section className="analytics-panel"><header><div><span>內容</span><h2>被看到最多的段落</h2></div></header><Breakdown items={sections} empty="新版追蹤上線後開始累積" /></section>
      </div>

      <section className="analytics-panel analytics-table-panel">
        <header><div><span>活動成效</span><h2>來源與廣告活動</h2></div><p>花費、CPC 與 CPA 會在 Google Ads API 憑證完成後加入。</p></header>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead><tr><th>活動／來源</th><th>工作階段</th><th>訪客</th><th>名單</th><th>轉換率</th></tr></thead>
            <tbody>
              {campaignRows.length ? campaignRows.map((row) => (
                <tr key={`${row.source}:${row.name}`}><td><strong>{row.name}</strong><span>{row.source}</span></td><td>{row.sessions}</td><td>{row.visitors}</td><td>{row.leads}</td><td>{row.rate}%</td></tr>
              )) : <tr><td colSpan={5}>目前還沒有活動資料</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-panel analytics-table-panel">
        <header><div><span>最近訪客</span><h2>逐筆查看流量品質</h2></div></header>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead><tr><th>訪客</th><th>時間</th><th>來源</th><th>裝置</th><th>深度</th><th>最後行為</th></tr></thead>
            <tbody>
              {sessions.slice(0, 20).map((session) => (
                <tr key={session.id}>
                  <td><Link href={`/admin/analytics/${session.id}`}>{session.visitor_key}</Link></td>
                  <td>{new Date(session.started_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</td>
                  <td>{sourceLabel(session)}</td><td>{session.device_type}</td><td>{session.max_scroll_depth}%</td><td>{session.last_stage || "page_view"}</td>
                </tr>
              ))}
              {!sessions.length ? <tr><td colSpan={6}>目前還沒有訪客資料</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
