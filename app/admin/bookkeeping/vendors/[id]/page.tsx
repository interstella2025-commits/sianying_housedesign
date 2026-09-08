import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BookkeepingVendorDetail } from "@/components/admin/bookkeeping/BookkeepingVendorDetail";
import { requireAdminPage } from "@/lib/admin-auth.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookkeepingVendorPage({ params }: PageProps) {
  await requireAdminPage();
  const { id } = await params;

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-header">
        <div>
          <p className="admin-note">
            <Link href="/admin/bookkeeping/vendors">← 返回廠商列表</Link>
          </p>
          <h1>廠商支出明細</h1>
        </div>
        <AdminLogoutButton />
      </div>
      <BookkeepingVendorDetail vendorId={id} />
    </div>
  );
}
