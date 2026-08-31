import type { Metadata } from "next";
import { Montserrat, Noto_Sans_TC } from "next/font/google";
import type { ReactNode } from "react";

import "./new-site.css";

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "新版空間作品集",
  description:
    "翔胤室內設計從格局、動線、材質到工程細節，打造與生活密不可分的空間。",
  alternates: {
    canonical: "/new",
  },
  openGraph: {
    title: "翔胤室內設計｜新版空間作品集",
    description: "讓室內空間與生活密不可分。",
    url: "/new",
    images: [
      {
        url: "/sites/senjin-design-com-dd40b413/root-8a5edab2/hero.jpg",
        alt: "翔胤室內設計打造的明亮現代住宅空間",
      },
    ],
  },
};

export default function NewDesignLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`senjin-clone ${notoSansTc.variable} ${montserrat.variable}`}
    >
      {children}
    </div>
  );
}
