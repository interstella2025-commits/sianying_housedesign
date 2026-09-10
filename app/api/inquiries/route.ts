import { createHmac } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import {
  getSupabaseTenantPassword,
} from "@/lib/supabase/env";
import {
  sendInquiryNotificationEmail,
  type InquiryNotification,
} from "@/lib/notifications/inquiry-email";
import { createSupabaseTenantClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TABLE_NAME = "sianying_inquiries";
const MAX_REQUEST_BYTES = 16_000;
const HOURLY_LIMIT = 5;

type InquiryBody = Record<string, unknown>;

function text(body: InquiryBody, key: string, maxLength: number) {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  return value.slice(0, maxLength);
}

function response(message: string, status: number) {
  return NextResponse.json(
    { ok: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function getVisitorHash(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return createHmac("sha256", getSupabaseTenantPassword())
    .update(`${ip}|${userAgent}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return response("送出內容過長", 413);
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) {
        return response("不允許跨網站送出", 403);
      }
    } catch {
      return response("來源網址無效", 403);
    }
  }

  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return response("表單格式無效", 400);
  }

  if (text(body, "website", 200)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const submittedAt = typeof body.submittedAt === "number" ? body.submittedAt : 0;
  if (submittedAt <= 0 || Date.now() - submittedAt < 700 || Date.now() - submittedAt > 14_400_000) {
    return response("請重新整理頁面後再送出", 400);
  }

  const formType = text(body, "formType", 20);
  const name = text(body, "name", 80);
  const phone = text(body, "phone", 20);
  const email = text(body, "email", 120);
  const phoneDigits = phone.replace(/\D/g, "");
  const inquiry: InquiryNotification = {
    formType: formType as InquiryNotification["formType"],
    name,
    phone,
    email,
    houseAge: text(body, "houseAge", 40),
    location: text(body, "location", 100),
    budget: text(body, "budget", 60),
    projectType: text(body, "projectType", 40),
    message: text(body, "message", 1200),
    lineId: text(body, "lineId", 80),
    sourcePath: text(body, "sourcePath", 200) || "/",
  };

  if (formType !== "consultation" && formType !== "reservation") {
    return response("詢問類型無效", 400);
  }
  if (!name || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return response("請填寫正確的姓名與電話", 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response("電子郵件格式不正確", 400);
  }

  try {
    const supabase = await createSupabaseTenantClient();
    const visitorHash = getVisitorHash(request);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from(TABLE_NAME)
      .select("id", { count: "exact", head: true })
      .eq("visitor_hash", visitorHash)
      .gte("created_at", since);

    if (countError) throw countError;
    if ((count ?? 0) >= HOURLY_LIMIT) {
      return response("送出次數過多，請稍後再試或直接使用 LINE 聯絡", 429);
    }

    const { error: insertError } = await supabase.from(TABLE_NAME).insert({
      form_type: formType,
      name,
      phone,
      email: email || null,
      house_age: inquiry.houseAge || null,
      location: inquiry.location || null,
      budget: inquiry.budget || null,
      project_type: inquiry.projectType || null,
      message: inquiry.message || null,
      line_id: inquiry.lineId || null,
      source_path: inquiry.sourcePath,
      visitor_hash: visitorHash,
    });

    if (insertError) throw insertError;

    try {
      await sendInquiryNotificationEmail(inquiry);
    } catch (emailError) {
      console.error("Unable to send inquiry notification", emailError);
    }

    return NextResponse.json(
      { ok: true },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to store inquiry", error);
    return response("目前無法儲存表單，請改用 LINE 或電話聯繫", 503);
  }
}
