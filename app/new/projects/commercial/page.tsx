import type { Metadata } from "next";

import { ProjectCategoryPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "商業與特殊空間｜翔胤室內設計",
  description: "翔胤室內設計商業與特殊空間作品。",
  alternates: { canonical: "/new/projects/commercial" },
};

export default function CommercialProjectsPage() {
  return <ProjectCategoryPage category="commercial" />;
}
