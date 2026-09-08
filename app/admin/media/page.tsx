import Link from "next/link";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminMediaPage() {
  await requireAdminPage();
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin">← 返回後台</Link>
          </p>
          <h1>媒體庫</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <MediaLibrary />
    </div>
  );
}
