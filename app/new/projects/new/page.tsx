import type { Metadata } from "next";

import { NewProjectsOverview } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "最新設計",
  description: "翔胤室內設計最新住宅與商業空間作品。",
  alternates: { canonical: "/projects/new" },
};

export default function NewProjectsPage() {
  return <NewProjectsOverview />;
}
