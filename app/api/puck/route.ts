import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { Data } from "@puckeditor/core";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { savePageData } from "@/lib/cms/pages";
import { isEditablePagePath } from "@/lib/puck/editable-pages";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const payload = (await request.json()) as { path?: string; data?: Data };
  if (!payload.path || !payload.data) {
    return NextResponse.json({ error: "缺少 path 或 data" }, { status: 400 });
  }
  if (!isEditablePagePath(payload.path)) {
    return NextResponse.json({ error: "此頁面不在可編輯清單中" }, { status: 404 });
  }

  await savePageData(payload.path, payload.data);
  revalidatePath(payload.path);
  if (payload.path === "/new") revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path") ?? "/new";
  if (!isEditablePagePath(path)) {
    return NextResponse.json({ error: "此頁面不在可編輯清單中" }, { status: 404 });
  }
  const { getPageData } = await import("@/lib/cms/pages");
  const data = await getPageData(path);
  return NextResponse.json({ path, data });
}
