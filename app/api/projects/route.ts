import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import {
  deleteStoredProject,
  getStoredProjects,
  saveStoredProjects,
  upsertStoredProject,
} from "@/lib/cms/projects-store";
import type { Project } from "@/lib/project-types";

function revalidateProjects(slug?: string) {
  for (const path of [
    "/",
    "/new/projects/new",
    "/new/projects/all",
    "/new/projects/residential",
    "/new/projects/commercial",
    "/new/projects/panorama",
  ]) revalidatePath(path);
  if (slug) revalidatePath(`/new/projects/${slug}`);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  return NextResponse.json({
    projects: await getStoredProjects({ includeDrafts: true }),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const project = (await request.json()) as Project;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug ?? "") || !project.title?.trim()) {
    return NextResponse.json({ error: "作品網址只能使用小寫英文、數字與連字號，且案名不可空白" }, { status: 400 });
  }
  const projects = await upsertStoredProject(project);
  revalidateProjects(project.slug);
  return NextResponse.json({ ok: true, projects });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const projects = (await request.json()) as Project[];
  if (!Array.isArray(projects)) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }
  await saveStoredProjects(projects);
  revalidateProjects();
  return NextResponse.json({ ok: true, projects });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  const projects = await deleteStoredProject(slug);
  revalidateProjects(slug);
  return NextResponse.json({ ok: true, projects });
}
