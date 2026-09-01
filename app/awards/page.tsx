import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ExternalPopupLink } from "../components/ExternalPopupLink";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "國際獎項",
  description:
    "翔胤室內設計作品《鉑金石韻》榮獲義大利 A' Design Award 國際設計獎。",
  alternates: { canonical: "/awards" },
};

const awardPageUrl = "https://competition.adesignaward.com/design.php?ID=136768";

const awardGallery = [
  {
    src: "/media/adesignaward-certificate-136768.png",
    alt: "A' Design Award 得獎證書，Platinum and Stone Sentiment Interior Design",
    caption: "Certificate / 01",
    narrow: true,
    contain: true,
  },
  {
    src: "/media/adesignaward-winner-page-136768.png",
    alt: "A' Design Award 官方得獎作品頁面，鉑金石韻",
    caption: "Winner page / 02",
    narrow: false,
    contain: true,
  },
  {
    src: "/media/adesignaward-trophy-136768.png",
    alt: "A' Design Award 得獎獎座與外盒",
    caption: "Award trophy / 03",
    narrow: true,
    contain: true,
  },
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
              src="/media/img-4409-f0dc5532e8.jpg"
              alt="A' Design Award 頒獎典禮現場"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="award-stage-shade" />
          <div className="award-stage-copy">
            <p className="section-kicker" data-hero-kicker>國際獎項 / Awards</p>
            <h1>
              <span className="line-mask"><span data-hero-word>2022 A&apos; Design Award</span></span>
              <span className="line-mask"><span data-hero-word>得獎紀錄</span></span>
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
            <h2>《鉑金石韻》<br />獲國際設計獎</h2>
            <p>恭喜《鉑金石韻（竹北）》榮獲 2022 年度義大利 A&apos; Design Award 國際設計獎。</p>
            <p>本案依屋主的收納、餐廚與動線需求重新配置格局，並以石材、金屬與木質控制空間比例與質感。</p>
            <p>作品經國際評審團評選後獲獎，相關作品資料與獎項紀錄如下。</p>
            <ExternalPopupLink
              className="outline-button"
              href={awardPageUrl}
              popupTitle="A' Design Award 得獎作品"
            >
              查看獲獎作品
              <ArrowUpRight aria-hidden="true" />
            </ExternalPopupLink>
            <p className="award-official-link">
              官方得獎頁面：
              <ExternalPopupLink href={awardPageUrl} popupTitle="A' Design Award 得獎作品">
                competition.adesignaward.com/design.php?ID=136768
              </ExternalPopupLink>
            </p>
          </div>
        </section>

        <section className="award-exhibition" data-horizontal>
          <div className="award-exhibition-track" data-horizontal-track>
            <article className="award-exhibition-intro">
              <p className="section-kicker">Exhibition archive</p>
              <h2>證書、官方頁面<br />與獎座紀錄</h2>
              <ExternalPopupLink
                className="outline-button award-exhibition-link"
                href={awardPageUrl}
                popupTitle="A' Design Award 得獎作品"
              >
                查看官方得獎頁面
                <ArrowUpRight aria-hidden="true" />
              </ExternalPopupLink>
              <span>向右滑動 / Scroll</span>
            </article>
            {awardGallery.map((image, index) => (
              <figure
                key={image.src}
                className={`award-exhibit award-exhibit-${index + 1}${image.narrow ? " award-exhibit-compact" : ""}${image.contain ? " award-exhibit-document" : ""}`}
              >
                <div className="award-exhibit-media" data-parallax>
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 899px) 100vw, 58vw" />
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
          <p>Selected works</p>
          <h2>查看其他<br />完工作品</h2>
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
