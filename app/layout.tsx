import type { Metadata } from "next";
import Script from "next/script";
import { AppProviders } from "./components/AppProviders";
import "./globals.css";
import "./new/new-site.css";
import "./site-custom.css";

const siteUrl = "https://sianying-housedesign.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  url: siteUrl,
  telephone: "+886-926-160-880",
  foundingDate: "2010",
  address: {
    "@type": "PostalAddress",
    streetAddress: "西雲路189號",
    addressLocality: "五股區",
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
    <html lang="zh-Hant" data-scroll-behavior="smooth">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-31YHHKNSCN"
          strategy="beforeInteractive"
        />
        <Script id="google-tag" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-31YHHKNSCN');
            gtag('config', 'AW-371055896');
          `}
        </Script>
        <Script id="google-conversion-events" strategy="beforeInteractive">
          {`
            (function () {
              if (window.__siangyinConversionEventsInstalled) return;
              window.__siangyinConversionEventsInstalled = true;

              document.addEventListener('click', function (event) {
                if (window.location.pathname.startsWith('/admin')) return;
                var target = event.target;
                if (!(target instanceof Element)) return;

                var submitButton = target.closest('[type="submit"]');
                if (submitButton) {
                  var form = submitButton.closest('form');
                  if (form && form.checkValidity()) {
                    gtag('event', '提交轉單01', { 'send_to': 'G-31YHHKNSCN' });
                  }
                }

                var phoneLink = target.closest('a[href*="tel:"]');
                if (phoneLink) {
                  gtag('event', '電話點擊01', { 'send_to': 'G-31YHHKNSCN' });
                }

                var lineLink = target.closest('a[href*="lin.ee"], a[href*="line.me"]');
                if (lineLink) {
                  gtag('event', 'line點擊01', { 'send_to': 'G-31YHHKNSCN' });
                }
              });

              window.addEventListener('load', function () {
                if (window.location.href.includes('/contact')) {
                  gtag('event', '網頁瀏覽01', { 'send_to': 'G-31YHHKNSCN' });
                }
              });
            })();
          `}
        </Script>
      </head>
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
