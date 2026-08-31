import type { Metadata } from "next";

import { ProjectCategoryPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-page";

export const metadata: Metadata = {
  title: "3D 全景作品｜翔胤室內設計",
  description: "以 360 度全景瀏覽翔胤室內設計作品的空間尺度與動線。",
  alternates: { canonical: "/new/projects/panorama" },
};

export default function PanoramaProjectsPage() {
  return <ProjectCategoryPage category="panorama" />;
}
