import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { createSupabaseTenantClient } from "@/lib/supabase/server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase
    .from("sianying_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiries: data });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const payload = (await request.json()) as {
    id?: string;
    status?: "new" | "contacted" | "closed";
  };
  if (!payload.id || !payload.status || !["new", "contacted", "closed"].includes(payload.status)) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }
  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase
    .from("sianying_inquiries")
    .update({ status: payload.status })
    .eq("id", payload.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase.from("sianying_inquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
