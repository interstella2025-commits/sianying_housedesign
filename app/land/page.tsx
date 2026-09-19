import type { Metadata } from "next";

import { LandExperience } from "./land-experience";

export const metadata: Metadata = {
  title: "平價北歐風裝修｜免費到場會勘",
  description:
    "翔胤室內設計整合北歐風設計、系統櫃與施工，快速安排免費到場會勘，七日內提供初步預算。",
  alternates: { canonical: "/land" },
  openGraph: {
    title: "平價北歐風裝修｜免費到場會勘",
    description: "系統櫃整合設計與施工，七日內提供初步預算。",
    url: "/land",
    images: [
      {
        url: "/sites/senjin-design-com-dd40b413/root-8a5edab2/projects/project-02.webp",
        alt: "翔胤室內設計北歐風住宅作品",
      },
    ],
  },
};

export default function LandingPage() {
  return <LandExperience />;
}
