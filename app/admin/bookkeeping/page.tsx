import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BookkeepingProjectsManager } from "@/components/admin/bookkeeping/BookkeepingProjectsManager";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminBookkeepingPage() {
  await requireAdminPage();
  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin">← 返回後台</Link>
          </p>
          <h1>裝修記帳</h1>
          <p className="admin-note">案件收支、工程支出與廠商應付款管理（與前台網站無關）。</p>
        </div>
        <AdminLogoutButton />
      </div>
      <BookkeepingProjectsManager />
    </div>
  );
}
