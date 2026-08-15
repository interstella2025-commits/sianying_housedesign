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
    "翔胤室內設計於 2010 年成立，提供住宅與商業空間設計、空間規劃、工程施工與完工保固服務。",
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
              src="/media/303943211-dc645a36a3.jpg"
              alt="翔胤室內設計住宅客廳作品"
              fill
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
          <div className="about-cinema-shade" />
          <div className="about-cinema-copy">
            <p className="section-kicker" data-hero-kicker>關於我們</p>
            <h1>
              <span className="line-mask"><span data-hero-word>住宅與</span></span>
              <span className="line-mask"><span data-hero-word>商業空間設計</span></span>
            </h1>
            <p data-hero-summary>
              翔胤室內設計於 2010 年成立，提供空間規劃、工程施工與完工保固服務。
            </p>
          </div>
          <div className="about-cinema-note" data-float-card>
            <span>Since</span>
            <strong>2010</strong>
            <p>Taipei · Taiwan</p>
          </div>
          <div className="about-cinema-cutout">
            <span>SIANG YIN</span>
            <strong>翔胤設計 X 北歐制作</strong>
          </div>
        </section>

        <section className="about-manifesto content-shell">
          <div className="manifesto-index" data-reveal>
            <span>01</span>
            <p>Design philosophy</p>
          </div>
          <div className="manifesto-copy" data-reveal>
            <p>讓室內空間與生活密不可分</p>
            <p>
              我們會先了解居住人數、生活習慣、收納需求與預算，再規劃格局、動線、材質與施工方式。
            </p>
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
                alt="翔胤室內設計設計總監"
                fill
                unoptimized
                sizes="(max-width: 899px) 100vw, 48vw"
              />
            </div>
            <div className="founder-experience" data-float-card>
              <strong>20+</strong>
              <span>Years of practice</span>
            </div>
            <p className="founder-vertical-name">DESIGN DIRECTOR</p>
          </div>

          <div className="founder-copy" data-reveal>
            <p className="section-kicker">設計師介紹</p>
            <p className="founder-role">2022 Iron A&apos; Design Award 得獎設計師</p>
            <h2>設計總監</h2>
            <p>投入室內設計產業超過 20 年，並於 2010 年在台北創立翔胤室內設計。</p>
            <Link className="outline-button" href={routes.awards}>
              查看國際獎項
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="studio-facts-panel content-shell" data-reveal>
          <article className="studio-fact-wide">
            <span>服務地區</span>
            <h2>台北 · 新北 · 桃園<br />新竹 · 宜蘭 · 台中</h2>
          </article>
          <article>
            <span>統一編號</span>
            <strong>{contact.companyId}</strong>
          </article>
          <article>
            <span>公司地址</span>
            <strong>{contact.headquarters}</strong>
          </article>
          <article>
            <span>設計中心</span>
            <strong>{contact.designCenter}</strong>
          </article>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Contact us</p>
          <h2>有裝修需求？<br />歡迎與我們聯絡。</h2>
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
