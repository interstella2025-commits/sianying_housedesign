import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { contact, routes } from "../data";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "翔胤設計 X 北歐制作創立於 2010 年，將繁複思維融入簡約生活空間。",
};

const values = ["LIGHT", "MATERIAL", "FUNCTION", "LIFE", "DETAIL"] as const;

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="about-page">
        <section className="about-cinema-hero">
          <div className="about-cinema-media" data-hero-media data-parallax>
            <Image
              src="/images/projects/stone-habitat/sjd-8233_1_orig.png"
              alt="翔胤室內設計棲於石境完工作品空間"
              fill
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
          <div className="about-cinema-shade" />
          <div className="about-cinema-copy">
            <p className="section-kicker" data-hero-kicker>關於我們 / About us</p>
            <h1>
              <span className="line-mask"><span data-hero-word>翔胤室內設計</span></span>
              <span className="line-mask"><span data-hero-word>成立於 2010 年</span></span>
            </h1>
          </div>
          <div className="about-cinema-note" data-float-card>
            <span>Since</span>
            <strong>2010</strong>
            <p>Taipei · Taiwan</p>
          </div>
          <div className="about-cinema-cutout">
            <div className="hero-notch-signature-copy">
              <span className="hero-notch-signature-kicker">SIANG YIN INTERIOR</span>
              <strong>住宅與商業空間設計</strong>
            </div>
          </div>
        </section>

        <section className="about-manifesto content-shell" data-reveal>
          <div className="about-manifesto-stack">
            <p className="about-manifesto-kicker">Our philosophy</p>
            <div className="manifesto-copy">
              <p>讓室內空間與生活密不可分</p>
              <p>我們從居住需求、動線與收納開始，再處理採光、材質與整體風格。</p>
            </div>
          </div>
        </section>

        <div className="values-marquee" aria-hidden="true">
          <div className="values-marquee-track">
            {[...values, ...values].map((value, index) => (
              <span key={`${value}-${index}`}>{value}<i>＊</i></span>
            ))}
          </div>
        </div>

        <section className="founder-feature content-shell">
          <div className="founder-visual" data-wipe>
            <div className="founder-portrait" data-parallax>
              <Image
                src="/media/grok-image-8edffe_orig-19da4d8d29.png"
                alt="翔胤室內設計專案設計師 Chou Su Zung"
                fill
                unoptimized
                sizes="(max-width: 899px) 100vw, 48vw"
              />
            </div>
            <div className="founder-experience" data-float-card>
              <strong>20+</strong>
              <span>Years of practice</span>
            </div>
            <p className="founder-vertical-name">FOUNDER / DESIGNER</p>
          </div>

          <div className="founder-copy" data-reveal>
            <p className="section-kicker">Designer profile</p>
            <p className="founder-role">義大利 A&apos; Design Award 國際認證設計師</p>
            <h2>Chou<br />Su Zung</h2>
            <p>21 歲退伍後投入室內設計產業，累積超過 20 年實務經驗，於 2010 年在台北創立翔胤室內設計。</p>
            <Link className="outline-button" href={routes.awards}>
              查看國際獎項
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="studio-facts-panel content-shell" data-reveal>
          <article className="studio-fact-wide">
            <span>Service area</span>
            <h2>台北 · 新北 · 桃園<br />新竹 · 宜蘭 · 台中</h2>
          </article>
          <article>
            <span>Company ID</span>
            <strong>{contact.companyId}</strong>
            <p>經濟部與財政部登記有案</p>
          </article>
          <article>
            <span>Design center</span>
            <strong>{contact.designCenter}</strong>
          </article>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Contact</p>
          <h2>歡迎與我們討論<br />你的空間</h2>
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
