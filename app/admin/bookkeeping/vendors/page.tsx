import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BookkeepingVendorsManager } from "@/components/admin/bookkeeping/BookkeepingVendorsManager";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminBookkeepingVendorsPage() {
  await requireAdminPage();
  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin">← 返回後台</Link>
          </p>
          <h1>廠商支出彙總</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <BookkeepingVendorsManager />
    </div>
  );
}
