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
    "翔胤室內設計作品《鉑金石韻》榮獲義大利 A' Design Award 國際設計獎。",
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
              alt="A' Design Award 得獎作品鉑金石韻"
              fill
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
          <div className="award-stage-shade" />
          <div className="award-stage-copy">
            <p className="section-kicker" data-hero-kicker>國際獎項 / Awards</p>
            <h1>
              <span className="line-mask"><span data-hero-word>鉑金石韻，</span></span>
              <span className="line-mask"><span data-hero-word>讓世界看見</span></span>
            </h1>
            <p data-hero-summary>2022 義大利 A&apos; Design Award<br />室內空間及展覽設計類得獎作品</p>
          </div>
          <div className="award-year-seal" data-float-card>
            <span>Winner</span>
            <strong>2022</strong>
            <p>Italy · A&apos; Design Award</p>
          </div>
        </section>

        <section className="award-editorial content-shell">
          <div className="award-editorial-year" data-award-year>
            <span>20</span><span>22</span>
          </div>
          <div className="award-editorial-copy" data-reveal>
            <p className="section-kicker">Platinum and Stone Sentiment</p>
            <h2>美學不是表面，<br />而是空間的秩序</h2>
            <p>恭喜《鉑金石韻（竹北）》榮獲 2022 年度義大利 A&apos; Design Award 國際設計獎。</p>
            <p>Chou Shu-Lung 設計師將美學素養轉化為空間邏輯，讓創意、平衡感與生活互相契合，呈現充滿都會氣度的優雅景致。</p>
            <p>作品從兩萬多件參賽作品中脫穎而出，獲各國評審委員肯定，展現翔胤獨特的美學視野與思考魅力。</p>
            <a className="outline-button" href="https://competition.adesignaward.com/design.php?ID=136768" target="_blank" rel="noreferrer">
              查看獲獎作品
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="award-exhibition" data-horizontal>
          <div className="award-exhibition-track" data-horizontal-track>
            <article className="award-exhibition-intro">
              <p className="section-kicker">Exhibition archive</p>
              <h2>把得獎那一刻，<br />展開成一條時間線</h2>
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
            <p className="section-kicker">About the award</p>
            <h2>跨越國界的<br />專業評選</h2>
          </header>
          <div className="award-credentials-copy" data-reveal>
            <p>A&apos; Design Award 是國際年度設計比賽，獲國際平面設計協會聯合會 ICOGRADA 與歐洲設計協會 BEDA 認可，也是 ICSID、ICOGRADA 與 ADI 義大利工業設計協會的成員組織。</p>
            <p>參賽作品採同行評審，由學者、新聞工作者與專業人士組成評審團匿名評選，表揚全球不同創意領域中的優秀設計師。</p>
            <div className="award-proof-grid">
              <div><strong>20,000+</strong><span>年度參賽作品</span></div>
              <div><strong>Global</strong><span>國際專業評審</span></div>
              <div><strong>Blind</strong><span>匿名評選制度</span></div>
            </div>
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Beyond the award</p>
          <h2>從得獎作品，<br />看見生活</h2>
          <Link className="primary-button" href="/works">
            <span>瀏覽作品</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
