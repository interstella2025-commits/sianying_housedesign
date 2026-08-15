import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "媒體採訪",
  description: "翔胤室內設計媒體報導、設計師資料與業主評價。",
};

const lineTodayUrl = "https://today.line.me/tw/v2/article/keVy7q";
const oneHundredUrl = "https://www.100.com.tw/5193";

export default function PressPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="press-page">
        <section className="press-hero">
          <div className="press-hero-copy">
            <p className="section-kicker" data-hero-kicker>媒體採訪</p>
            <h1>
              <span className="line-mask"><span data-hero-word>媒體報導</span></span>
              <span className="line-mask"><span data-hero-word>與設計師資料</span></span>
            </h1>
            <p data-hero-summary>本頁收錄作品報導、設計師資料與業主評價。</p>
          </div>

          <div className="press-hero-media" data-hero-media data-parallax>
            <Image
              src="/media/myvideo_0312_111-be044f433c.jpg"
              alt="翔胤室內設計住宅空間媒體影像"
              fill
              priority
              unoptimized
              sizes="(max-width: 899px) 100vw, 62vw"
            />
          </div>
        </section>

        <section className="press-feature content-shell">
          <div className="press-feature-media" data-wipe data-parallax>
            <Image
              src="/images/projects/platinum-stone/sjd-6699_2.png"
              alt="翔胤室內設計作品鉑金石韻"
              fill
              unoptimized
              sizes="(max-width: 899px) 100vw, 58vw"
            />
          </div>
          <article data-reveal>
            <div className="press-source"><span>LINE TODAY</span><span>Media feature</span></div>
            <h2>LINE TODAY｜作品報導</h2>
            <p>報導內容包含格局、採光、材質與居住需求等設計考量。</p>
            <a className="outline-button" href={lineTodayUrl} target="_blank" rel="noreferrer">
              閱讀 LINE TODAY 報導
              <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
        </section>

        <section className="press-profile content-shell">
          <article data-reveal>
            <div className="press-source"><span>100 室內設計</span><span>Designer profile</span></div>
            <h2>100 室內設計｜設計師專頁</h2>
            <p>查看完工作品、業主評價與設計團隊資料。</p>
            <a className="outline-button" href={oneHundredUrl} target="_blank" rel="noreferrer">
              查看設計師專頁
              <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
          <div className="press-profile-media" data-wipe data-parallax>
            <Image
              src="/images/projects/second-order-space/sjd-9831.png"
              alt="翔胤室內設計住宅作品"
              fill
              unoptimized
              sizes="(max-width: 899px) 100vw, 52vw"
            />
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Contact us</p>
          <h2>有裝修需求？<br />歡迎預約丈量。</h2>
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
