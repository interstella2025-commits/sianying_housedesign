import type { Metadata } from "next";

import { NewProjectsOverview } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "最新設計｜翔胤室內設計",
  description: "翔胤室內設計最新住宅、商業空間與 3D 全景作品。",
  alternates: { canonical: "/new/projects/new" },
};

export default function NewProjectsPage() {
  return <NewProjectsOverview />;
}
