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
            <p className="section-kicker" data-hero-kicker>關於我們 / About us</p>
            <h1>
              <span className="line-mask"><span data-hero-word>理解生活，</span></span>
              <span className="line-mask"><span data-hero-word>才開始設計</span></span>
            </h1>
          </div>
          <div className="about-cinema-note" data-float-card>
            <span>Since</span>
            <strong>2010</strong>
            <p>Taipei · Taiwan</p>
          </div>
          <div className="about-cinema-cutout">
            <span>SIANG YIN</span>
            <strong>把美感放回日常</strong>
          </div>
        </section>

        <section className="about-manifesto content-shell">
          <div className="manifesto-index" data-reveal>
            <span>01</span>
            <p>Our philosophy</p>
          </div>
          <div className="manifesto-copy" data-reveal>
            <p>把繁複思維，融入簡約生活</p>
            <p>讓宅美學與居家機能並行，從原本的生活動線出發，開創真正屬於居住者的樂活空間。</p>
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
            <p>After retiring from the military at the age of 21, he spent more than 20 years in the industry and founded Xiang Yin Interior Design in Taipei in 2010.</p>
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
          <p>Design for living</p>
          <h2>一起整理空間，<br />也整理生活</h2>
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
