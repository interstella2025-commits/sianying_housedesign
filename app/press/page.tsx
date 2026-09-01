import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ExternalPopupLink } from "../components/ExternalPopupLink";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "媒體採訪",
  description: "翔胤室內設計媒體專訪、設計觀點、作品報導與外部媒體收錄。",
  alternates: { canonical: "/press" },
};

const oneHundredUrl = "https://www.100.com.tw/5193";

export default function PressPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="press-page">
        <section className="press-hero">
          <div className="press-hero-copy">
            <p className="section-kicker" data-hero-kicker>媒體採訪 / Press</p>
            <h1>
              <span className="line-mask"><span data-hero-word>媒體報導</span></span>
              <span className="line-mask"><span data-hero-word>與設計師專訪</span></span>
            </h1>
            <p data-hero-summary>本頁收錄翔胤室內設計的媒體報導、作品介紹與設計師專頁。</p>
          </div>

          <div className="press-hero-media" data-hero-media data-parallax>
            <Image
              src="/images/projects/realm-of-light/sjd-2236_orig.png"
              alt="翔胤室內設計御光境完工作品空間"
              fill
              priority
              sizes="(max-width: 899px) 100vw, 62vw"
            />
          </div>
        </section>

        <section className="press-opening content-shell">
          <p data-reveal>
            媒體報導提供作品資訊，也記錄設計與施工過程中的實際考量
          </p>
          <div data-reveal>
            <span>翔胤設計 X 北歐制作</span>
            <p>內容包含採光、材質、機能、預算與工程細節，方便進一步了解我們的工作方式。</p>
          </div>
        </section>

        <section className="press-profile content-shell">
          <article data-reveal>
            <div className="press-source"><span>100 室內設計</span><span>Designer profile</span></div>
            <h2>100 室內設計 設計師專頁</h2>
            <p>專頁收錄翔胤設計 X 北歐制作的作品、業主點評與設計師資料。</p>
            <ExternalPopupLink className="outline-button" href={oneHundredUrl} popupTitle="100 室內設計 設計師專頁">
              查看設計師專頁
              <ArrowUpRight aria-hidden="true" />
            </ExternalPopupLink>
          </article>
          <div className="press-profile-media" data-wipe data-parallax>
            <Image
              src="/images/projects/second-order-space/sjd-9831_orig.png"
              alt="翔胤室內設計住宅作品"
              fill
              sizes="(max-width: 899px) 100vw, 52vw"
            />
          </div>
        </section>

        <section className="press-statement content-shell" data-wipe>
          <p>Information</p>
          <h2>設計觀點與<br />施工資訊</h2>
          <div>
            <p>報導內容補充案例照片以外的設計條件、施工方式與選材考量。</p>
            <p>本頁將持續更新媒體專訪與相關外部連結。</p>
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Contact</p>
          <h2>有裝修需求？<br />與我們聯絡</h2>
          <Link className="primary-button" href="/#contact">
            <span>預約丈量</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
