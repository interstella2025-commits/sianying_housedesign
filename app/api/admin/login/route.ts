import { NextResponse } from "next/server";

import { getSupabaseTenantId } from "@/lib/supabase/env";
import {
  COOKIE_NAME,
  createAdminSessionToken,
  SESSION_MAX_AGE_SECONDS,
  verifyAdminPassword,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (!password || !(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "管理密碼錯誤" }, { status: 401 });
  }

  const token = await createAdminSessionToken(getSupabaseTenantId());

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
