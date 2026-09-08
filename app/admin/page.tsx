import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { requireAdminPage } from "@/lib/admin-auth.server";
import { EDITABLE_PAGE_LABELS, EDITABLE_PAGE_PATHS } from "@/lib/puck/editable-pages";

const pageEditors = EDITABLE_PAGE_PATHS.map((path) => ({
  href: path === "/" ? "/admin/edit" : `/admin/edit${path}`,
  label: EDITABLE_PAGE_LABELS[path],
}));

export default async function AdminDashboardPage() {
  await requireAdminPage();
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>翔胤後台</h1>
        <AdminLogoutButton />
      </div>

      <div className="admin-sections">
        <section className="admin-section">
          <h2 className="admin-section-title">客戶詢問</h2>
          <div className="admin-grid admin-grid-single">
            <Link className="admin-card" href="/admin/inquiries">
              <h3>網站表單與聯絡進度</h3>
              <p>新詢問、已聯絡、已結案</p>
            </Link>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">介面文字編輯</h2>
          <p className="admin-note">所有公開頁面的主標、說明、圖片與補充圖文區塊都可用 Puck 編輯。</p>
          <div className="admin-grid admin-grid-pages">
            {pageEditors.map((item) => (
              <Link className="admin-card" href={item.href} key={item.href}>
                <h3>{item.label}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">作品案例</h2>
          <div className="admin-grid admin-grid-single">
            <Link className="admin-card" href="/admin/projects">
              <h3>作品案例管理</h3>
              <p>上傳封面、完整相簿與 3D 全景展開圖</p>
            </Link>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">裝修記帳</h2>
          <div className="admin-grid admin-grid-single">
            <Link className="admin-card" href="/admin/bookkeeping">
              <h3>案件收支與廠商應付</h3>
              <p>案件、收入、支出、付款、稅務與 CSV 報表</p>
            </Link>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">影音媒體</h2>
          <div className="admin-grid admin-grid-single">
            <Link className="admin-card" href="/admin/media">
              <h3>媒體庫</h3>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
