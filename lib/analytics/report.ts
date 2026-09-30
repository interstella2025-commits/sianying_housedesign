import type { Database } from "@/lib/supabase/database.types";

export type AnalyticsSession = Database["public"]["Tables"]["sianying_web_sessions"]["Row"];
export type AnalyticsEvent = Database["public"]["Tables"]["sianying_web_events"]["Row"];

export function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 1000) / 10 : 0;
}

export function sourceLabel(session: AnalyticsSession) {
  if (session.gclid || /^(cpc|ppc|paid_search)$/i.test(session.utm_medium || "")) return "Google Ads";
  if (session.utm_source) {
    return session.utm_medium ? `${session.utm_source} / ${session.utm_medium}` : session.utm_source;
  }
  if (session.referrer) {
    try {
      const host = new URL(session.referrer).hostname.replace(/^www\./, "");
      if (/google\./i.test(host)) return "Google 自然搜尋";
      if (/facebook|instagram/i.test(host)) return "社群推薦";
      return host;
    } catch {
      return "其他推薦";
    }
  }
  return "直接流量";
}

export function isPaidGoogle(session: AnalyticsSession) {
  return sourceLabel(session) === "Google Ads";
}

export function sessionDurationSeconds(session: AnalyticsSession) {
  return Math.max(0, Math.round((new Date(session.last_seen_at).getTime() - new Date(session.started_at).getTime()) / 1000));
}

export function durationLabel(seconds: number) {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} 分 ${rest} 秒`;
}

export function dateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

export function eventSessionIds(events: AnalyticsEvent[], name: string) {
  return new Set(events.filter((event) => event.event_name === name).map((event) => event.session_id));
}
