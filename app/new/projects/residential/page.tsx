import type { Metadata } from "next";

import { ProjectCategoryPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "住宅空間｜翔胤室內設計",
  description: "翔胤室內設計住宅空間作品，以光、材質與生活動線貼近日常。",
  alternates: { canonical: "/new/projects/residential" },
};

export default function ResidentialProjectsPage() {
  return <ProjectCategoryPage category="residential" />;
}
