import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BookkeepingLedgerSheet } from "@/components/admin/bookkeeping/BookkeepingLedgerSheet";
import { requireAdminPage } from "@/lib/admin-auth.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookkeepingProjectPage({ params }: PageProps) {
  await requireAdminPage();
  const { id } = await params;

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin/bookkeeping">← 返回記帳</Link>
          </p>
          <h1>案件收支表</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <BookkeepingLedgerSheet projectId={id} />
    </div>
  );
}
