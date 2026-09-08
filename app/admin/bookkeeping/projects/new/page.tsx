import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BookkeepingLedgerSheet } from "@/components/admin/bookkeeping/BookkeepingLedgerSheet";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminBookkeepingNewProjectPage() {
  await requireAdminPage();
  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin/bookkeeping">← 返回記帳</Link>
          </p>
          <h1>新增案件收支表</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <BookkeepingLedgerSheet />
    </div>
  );
}
