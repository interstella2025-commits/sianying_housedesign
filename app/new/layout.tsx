import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NewDesignFrame } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-design-frame";

export const metadata: Metadata = {
  title: "新版空間作品集",
  description:
    "翔胤室內設計從格局、動線、材質到工程細節，打造與生活密不可分的空間。",
  openGraph: {
    title: "翔胤室內設計｜新版空間作品集",
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

export default function NewDesignLayout({ children }: { children: ReactNode }) {
  return <NewDesignFrame>{children}</NewDesignFrame>;
}
