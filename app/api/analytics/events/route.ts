import { createHmac } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseTenantPassword } from "@/lib/supabase/env";
import { createSupabaseTenantClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventInput = {
  name: string;
  pagePath: string;
  occurredAt: string;
  sectionId?: string;
  data?: Record<string, string | number | boolean | null>;
};

type Payload = {
  visitorId: string;
  sessionId: string;
  startedAt: string;
  landingUrl: string;
  referrer?: string;
  viewportWidth: number;
  attribution?: Record<string, unknown>;
  events: EventInput[];
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const eventPattern = /^[a-z0-9_]{1,80}$/;

function clipped(value: unknown, length: number) {
  return typeof value === "string" ? value.slice(0, length) : "";
}

function requestIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
    .split(",")[0]
    .trim();
}

function deviceType(userAgent: string, viewportWidth: number) {
  if (/ipad|tablet/i.test(userAgent) || (viewportWidth >= 640 && viewportWidth < 1024)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent) || viewportWidth < 640) return "mobile";
  if (viewportWidth >= 1024) return "desktop";
  return "unknown";
}

function validDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validate(input: unknown): input is Payload {
  if (!input || typeof input !== "object") return false;
  const value = input as Partial<Payload>;
  if (!value.visitorId || !uuidPattern.test(value.visitorId)) return false;
  if (!value.sessionId || !uuidPattern.test(value.sessionId)) return false;
  if (!validDate(value.startedAt) || typeof value.landingUrl !== "string") return false;
  if (typeof value.viewportWidth !== "number" || value.viewportWidth < 0 || value.viewportWidth > 10000) return false;
  if (!Array.isArray(value.events) || value.events.length < 1 || value.events.length > 50) return false;
  return value.events.every((event) => (
    Boolean(event) &&
    eventPattern.test(event.name) &&
    typeof event.pagePath === "string" &&
    event.pagePath.length <= 2048 &&
    validDate(event.occurredAt)
  ));
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    if (raw.length > 64_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const input: unknown = JSON.parse(raw);
    if (!validate(input)) {
      return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
    }

    const attribution = input.attribution || {};
    const firstEvent = input.events[0];
    const lastEvent = input.events[input.events.length - 1];
    const maxDepth = input.events.reduce((maximum, event) => {
      const depth = event.data?.depth;
      return typeof depth === "number" ? Math.max(maximum, Math.min(100, Math.round(depth))) : maximum;
    }, 0);
    const hash = createHmac("sha256", getSupabaseTenantPassword())
      .update(requestIp(request))
      .digest("hex");
    const visitorKey = `${hash.slice(0, 8).toUpperCase()}-${input.visitorId.slice(0, 6).toUpperCase()}`;
    const supabase = await createSupabaseTenantClient();

    const { error: insertError } = await supabase.from("sianying_web_sessions").upsert({
      id: input.sessionId,
      visitor_id: input.visitorId,
      visitor_key: visitorKey,
      ip_hash: hash,
      started_at: input.startedAt,
      last_seen_at: lastEvent.occurredAt,
      landing_path: firstEvent.pagePath,
      landing_url: clipped(input.landingUrl, 2048),
      last_page_path: lastEvent.pagePath,
      referrer: clipped(input.referrer, 2048) || null,
      device_type: deviceType(request.headers.get("user-agent") || "", input.viewportWidth),
      viewport_width: Math.round(input.viewportWidth),
      utm_source: clipped(attribution.utmSource, 300) || null,
      utm_medium: clipped(attribution.utmMedium, 300) || null,
      utm_campaign: clipped(attribution.utmCampaign, 500) || null,
      utm_content: clipped(attribution.utmContent, 500) || null,
      utm_term: clipped(attribution.utmTerm, 500) || null,
      campaign_id: clipped(attribution.campaignId, 200) || null,
      ad_group_id: clipped(attribution.adGroupId, 200) || null,
      ad_id: clipped(attribution.adId, 200) || null,
      gclid: clipped(attribution.gclid, 500) || null,
      max_scroll_depth: maxDepth,
      last_stage: clipped(lastEvent.sectionId || lastEvent.name, 200),
    }, { onConflict: "id", ignoreDuplicates: true });
    if (insertError) throw insertError;

    const { data: existing, error: readError } = await supabase
      .from("sianying_web_sessions")
      .select("max_scroll_depth")
      .eq("id", input.sessionId)
      .single();
    if (readError) throw readError;

    const { error: updateError } = await supabase.from("sianying_web_sessions").update({
      last_seen_at: lastEvent.occurredAt,
      last_page_path: lastEvent.pagePath,
      max_scroll_depth: Math.max(existing.max_scroll_depth || 0, maxDepth),
      last_stage: clipped(lastEvent.sectionId || lastEvent.name, 200),
      updated_at: new Date().toISOString(),
    }).eq("id", input.sessionId);
    if (updateError) throw updateError;

    const { error: eventsError } = await supabase.from("sianying_web_events").insert(
      input.events.map((event) => ({
        session_id: input.sessionId,
        visitor_id: input.visitorId,
        event_name: event.name,
        page_path: event.pagePath,
        section_id: clipped(event.sectionId, 200) || null,
        event_data: event.data || {},
        occurred_at: event.occurredAt,
      })),
    );
    if (eventsError) throw eventsError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Web analytics ingestion failed", error);
    return NextResponse.json({ error: "Unable to record analytics" }, { status: 400 });
  }
}
