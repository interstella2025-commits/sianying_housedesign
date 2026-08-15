import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "國際獎項",
  description:
    "翔胤室內設計作品《鉑金石韻》榮獲 2022 Iron A' Design Award 室內空間及展覽設計類得獎作品。",
};

const awardGallery = [
  { src: "/media/img-4408_orig-331e5e8f91.jpg", alt: "A' Design Award 獎座", caption: "Award trophy / 01" },
  { src: "/media/img-4409-f0dc5532e8.jpg", alt: "A' Design Award 頒獎典禮", caption: "Award ceremony / 02" },
  { src: "/media/img-4411_orig-27f60da3a7.jpg", alt: "A' Design Award 展覽現場", caption: "International exhibition / 03" },
  { src: "/media/dsc-23686-b4f132e494.png", alt: "A' Design Award 得獎證書", caption: "Certificate / 04" },
] as const;

export default function AwardsPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="awards-page">
        <section className="award-stage-hero">
          <div className="award-stage-media" data-hero-media data-parallax>
            <Image
              src="/projects/project-03-1.png"
              alt="Iron A' Design Award 得獎作品鉑金石韻"
              fill
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
          <div className="award-stage-shade" />
          <div className="award-stage-copy">
            <p className="section-kicker" data-hero-kicker>國際獎項</p>
            <h1>
              <span className="line-mask"><span data-hero-word>《鉑金石韻》</span></span>
              <span className="line-mask"><span data-hero-word>獲 2022 Iron A&apos; Design Award</span></span>
            </h1>
            <p data-hero-summary>《鉑金石韻》為 2022 年室內空間及展覽設計類得獎作品。</p>
          </div>
          <div className="award-year-seal" data-float-card>
            <span>Winner</span>
            <strong>2022</strong>
            <p>Iron A&apos; Design Award</p>
          </div>
        </section>

        <section className="award-editorial content-shell">
          <div className="award-editorial-year" data-award-year>
            <span>20</span><span>22</span>
          </div>
          <div className="award-editorial-copy" data-reveal>
            <p className="section-kicker">得獎作品介紹</p>
            <h2>《鉑金石韻》</h2>
            <p>
              本案為約 120 平方公尺的單層住宅。依屋主需求放大廚房，並將中島、餐桌與餐區安排在同一條動線上。書房臨走道的隔間拆除後，廊道縮短，公共區域也更加開放。
            </p>
            <a className="outline-button" href="https://competition.adesignaward.com/design.php?ID=136768" target="_blank" rel="noreferrer">
              查看獲獎頁面
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="award-exhibition" data-horizontal>
          <div className="award-exhibition-track" data-horizontal-track>
            <article className="award-exhibition-intro">
              <p className="section-kicker">照片紀錄</p>
              <h2>獎盃、頒獎典禮<br />與展覽紀錄</h2>
              <span>向右滑動 / Scroll</span>
            </article>
            {awardGallery.map((image, index) => (
              <figure key={image.src} className={`award-exhibit award-exhibit-${index + 1}`}>
                <div className="award-exhibit-media" data-parallax>
                  <Image src={image.src} alt={image.alt} fill unoptimized sizes="(max-width: 899px) 100vw, 58vw" />
                </div>
                <figcaption><span>{image.caption}</span><strong>{String(index + 1).padStart(2, "0")}</strong></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="award-credentials content-shell">
          <header data-reveal>
            <p className="section-kicker">關於 A&apos; Design Award</p>
            <h2>關於<br />A&apos; Design Award</h2>
          </header>
          <div className="award-credentials-copy" data-reveal>
            <p>
              A&apos; Design Award 為國際設計競賽。獎項類別與評選方式請參閱主辦單位官方網站。
            </p>
            <a className="outline-button" href="https://competition.adesignaward.com/" target="_blank" rel="noreferrer">
              前往官方網站
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>View the project</p>
          <h2>查看《鉑金石韻》<br />完整作品</h2>
          <Link className="primary-button" href="/works">
            <span>瀏覽完工作品集</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
