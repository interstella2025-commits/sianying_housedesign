import type { Metadata } from "next";

import { NewDesignFrame } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-design-frame";
import { NewHomeContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-home-content";
import { getPageSettings } from "@/lib/cms/pages";
import { getStoredProjects } from "@/lib/cms/projects-store";

export const metadata: Metadata = {
  title: "翔胤室內設計｜住宅、商業空間與舊屋翻修作品集",
  description:
    "翔胤室內設計從格局、動線、材質到工程細節，打造與生活密不可分的住宅與商業空間。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "翔胤室內設計｜空間作品集",
    description: "讓室內空間與生活密不可分。",
    url: "/",
    images: [
      {
        url: "/sites/senjin-design-com-dd40b413/root-8a5edab2/hero.jpg",
        alt: "翔胤室內設計打造的明亮現代住宅空間",
      },
    ],
  },
};

export default async function HomePage() {
  const [settings, projects] = await Promise.all([
    getPageSettings("/new"),
    getStoredProjects(),
  ]);
  return (
    <NewDesignFrame>
      <NewHomeContent settings={settings} projects={projects} />
    </NewDesignFrame>
  );
}
