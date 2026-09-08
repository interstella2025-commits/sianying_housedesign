import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { InquiriesManager } from "@/components/admin/InquiriesManager";
import { requireAdminPage } from "@/lib/admin-auth.server";

export default async function AdminInquiriesPage() {
  await requireAdminPage();
  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note"><Link href="/admin">← 返回後台</Link></p>
          <h1>網站詢問</h1>
          <p className="admin-note">查看正式網站送出的預約與聯絡表單。</p>
        </div>
        <AdminLogoutButton />
      </div>
      <InquiriesManager />
    </div>
  );
}
