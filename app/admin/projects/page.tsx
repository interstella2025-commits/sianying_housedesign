import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminProjectsPage() {
  await requireAdminPage();
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin">← 返回後台</Link>
          </p>
          <h1>作品案例</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <ProjectsManager />
    </div>
  );
}
