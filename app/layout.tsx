import type { Metadata } from "next";
import { AppProviders } from "./components/AppProviders";
import "./globals.css";
import "./site-custom.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.siangyin.com"),
  title: {
    default: "翔胤室內設計",
    template: "%s｜翔胤室內設計",
  },
  description:
    "翔胤室內設計提供住宅、商業空間、舊屋翻修、毛胚屋規劃與完整工程服務。",
  icons: {
    icon: "/media/siang-yin-logo.png",
    shortcut: "/media/siang-yin-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "翔胤室內設計",
    title: "翔胤室內設計",
    description: "把繁複思維融入簡約生活，從光、材質與動線出發。",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "翔胤室內設計",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "翔胤室內設計",
    description: "把繁複思維融入簡約生活，從光、材質與動線出發。",
    images: ["/og.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "InteriorDesign",
  name: "翔胤室內設計有限公司",
  alternateName: "翔胤設計 X 北歐制作",
  url: "https://www.siangyin.com/",
  telephone: "+886-2-2288-8123",
  foundingDate: "2010",
  address: {
    "@type": "PostalAddress",
    streetAddress: "中山一路 114-1 號 10 樓",
    addressLocality: "蘆洲區",
    addressRegion: "新北市",
    addressCountry: "TW",
  },
  sameAs: [
    "https://www.facebook.com/Wanna.Ju.design/",
    "https://www.instagram.com/su_zung/",
    "https://www.youtube.com/@Wanna_Ju",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <AppProviders>{children}</AppProviders>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
