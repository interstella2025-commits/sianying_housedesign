import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";

export async function requireBookkeepingAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  return null;
}

export function bookkeepingErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "操作失敗";
  const status = message.includes("找不到") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
