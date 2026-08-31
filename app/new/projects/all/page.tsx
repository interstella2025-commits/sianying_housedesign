import type { Metadata } from "next";

import { ProjectCategoryPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "全部作品｜翔胤室內設計",
  description: "完整瀏覽翔胤室內設計住宅與商業空間作品。",
  alternates: { canonical: "/new/projects/all" },
};

export default function AllProjectsPage() {
  return <ProjectCategoryPage category="all" />;
}
