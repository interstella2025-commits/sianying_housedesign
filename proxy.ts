import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  const isProtected =
    (pathname.startsWith("/admin") && !isLogin) ||
    pathname.startsWith("/api/bookkeeping") ||
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/puck") ||
    pathname.startsWith("/api/upload");

  if (!isProtected) return NextResponse.next();

  const authenticated = await verifyAdminSessionToken(
    request.cookies.get(COOKIE_NAME)?.value,
  );
  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/bookkeeping/:path*",
    "/api/projects/:path*",
    "/api/puck/:path*",
    "/api/upload/:path*",
  ],
};
