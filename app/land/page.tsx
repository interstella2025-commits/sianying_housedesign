import type { Metadata } from "next";

import { LandExperience } from "./land-experience";

export const metadata: Metadata = {
  title: { absolute: "平價北歐風裝修｜得獎設計師免費到場會勘｜翔胤室內設計" },
  description:
    "翔胤室內設計，由得獎設計師親自到場會勘，依屋況與預算規劃平價北歐風。整合設計、系統櫃與施工，免費會勘，7 日內提供初步預算。",
  alternates: { canonical: "/land" },
  openGraph: {
    title: "得獎設計師免費到場會勘｜為你規劃平價北歐風的家",
    description:
      "裝修不知道預算怎麼抓？先免費到場會勘，7 日內提供初步預算。翔胤整合設計、系統櫃與施工，讓你更快入住。",
    url: "/land",
    images: [
      {
        url: "/images/projects/serenity-within/sjd-0060_orig.jpg",
        alt: "翔胤室內設計北歐風住宅作品",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "得獎設計師免費到場會勘｜為你規劃平價北歐風的家",
    description:
      "裝修不知道預算怎麼抓？先免費到場會勘，7 日內提供初步預算。翔胤整合設計、系統櫃與施工，讓你更快入住。",
    images: ["/images/projects/serenity-within/sjd-0060_orig.jpg"],
  },
};

export default function LandingPage() {
  return <LandExperience />;
}
