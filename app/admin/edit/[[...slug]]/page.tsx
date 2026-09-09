import type { Data } from "@puckeditor/core";
import { notFound } from "next/navigation";
import { getDefaultPageData, getPageData } from "@/lib/cms/pages";
import { normalizePageData } from "@/lib/cms/normalize-page-data";
import { getStoredProjects } from "@/lib/cms/projects-store";
import {
  EDITABLE_PAGE_LABELS,
  isEditablePagePath,
} from "@/lib/puck/editable-pages";
import { PuckEditorClient } from "@/components/admin/PuckEditorClient";
import { requireAdminPage } from "@/lib/admin-auth.server";

type AdminEditPageProps = {
  params: Promise<{ slug?: string[] }>;
};

function pathFromSlug(slug?: string[]) {
  if (!slug?.length) return "/";
  return `/${slug.join("/")}`;
}

export default async function AdminEditPage({ params }: AdminEditPageProps) {
  await requireAdminPage();
  const { slug } = await params;
  const path = pathFromSlug(slug);
  if (!isEditablePagePath(path)) notFound();

  const [stored, previewProjects] = await Promise.all([
    getPageData(path),
    getStoredProjects(),
  ]);
  const fallback = getDefaultPageData(path);
  const source = stored ?? fallback;
  if (!source) notFound();

  const data = normalizePageData(source as Data);

  return (
    <div className="admin-editor-shell">
      <PuckEditorClient
        path={path}
        initialData={data}
        headerTitle={EDITABLE_PAGE_LABELS[path]}
        previewProjects={previewProjects}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
