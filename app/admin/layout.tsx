import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "翔胤網站後台",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
