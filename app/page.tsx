import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { FilmPlayer } from "./components/FilmPlayer";
import { MotionDirector } from "./components/MotionDirector";
import { ProjectPresentation } from "./components/ProjectPresentation";
import { ReservationForm } from "./components/ReservationForm";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { contact, routes } from "./data";

export const metadata: Metadata = {
  title: "翔胤室內設計｜住宅、商業空間與舊屋翻修",
  description:
    "翔胤室內設計完工作品集。從光、材質與動線出發，提供住宅、商業空間、舊屋翻修與毛胚屋規劃服務。",
};

export default function Home() {
  return (
    <div className="home-page">
      <SiteHeader integrated />
      <MotionDirector />
      <main>
        <section className="home-hero">
          <div className="hero-frame" data-hero-media data-parallax>
            <Image
              src="/media/303943211-dc645a36a3.jpg"
              alt="翔胤室內設計打造的現代住宅客廳"
              fill
              priority
              unoptimized
              sizes="100vw"
            />
          </div>

          <div className="home-hero-copy">
            <h1>
              <span className="line-mask">
                <span data-hero-word>把繁複思維</span>
              </span>
              <span className="line-mask">
                <span data-hero-word>融入簡約生活</span>
              </span>
            </h1>
            <p data-hero-summary>
              從光、材質與動線出發，讓家的機能與感受自然相遇。
            </p>
          </div>

          <div
            className="hero-notch hero-notch-signature"
            data-block-slot="hero-project-entry"
          >
            <strong data-hero-kicker>翔胤設計 X 北歐制作</strong>
          </div>
        </section>

        <section className="studio-intro content-shell" data-reveal>
          <div className="studio-statement">
            <p>空間不是風格的堆疊，而是生活被理解之後，留下的秩序</p>
          </div>
          <div className="studio-facts">
            <div>
              <strong>2010</strong>
              <span>創立於台北</span>
            </div>
            <div>
              <strong>20+</strong>
              <span>年產業經驗</span>
            </div>
            <div>
              <strong>A&apos; Design</strong>
              <span>國際設計獎肯定</span>
            </div>
          </div>
        </section>

        <ProjectPresentation />

        <section className="service-preview content-shell">
          <div className="service-preview-copy" data-reveal>
            <h2>設計，直到入住之後仍然成立</h2>
            <p>
              從圖面、預算、工序到交屋保固，以清楚的節點讓想像逐步成形。
            </p>
            <Link className="outline-button" href={routes.services}>
              查看服務與收費
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="service-preview-list" data-reveal>
            {["室內設計", "裝修工程", "商業空間", "舊屋翻修", "毛胚屋規劃"].map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
                <ArrowRight aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section className="film-section content-shell" data-reveal>
          <FilmPlayer
            videoId={contact.featuredVideoId}
            poster="/media/myvideo_0312_111-be044f433c.jpg"
            title="心如境"
          />
          <div className="film-copy">
            <h2>心如境</h2>
            <p className="film-title">Serenity Within: When Space Reflects the Mind</p>
            <p>
              空間不僅承載功能，也成為一種生活修行。讓自然光影、柔和色調與材質留白，帶居住者回到內在。
            </p>
            <a href={contact.youtube} target="_blank" rel="noreferrer">
              更多精彩影片
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy" data-reveal>
            <p className="section-kicker">線上預約丈量</p>
            <h2>告訴我們，你想如何生活</h2>
            <p>公司將盡速派專人與您聯絡。</p>
            <div className="contact-direct">
              <a href="tel:0222888123">{contact.phone}</a>
              <a href={contact.lineUrl} target="_blank" rel="noreferrer">
                LINE {contact.line}
              </a>
            </div>
          </div>
          <div data-reveal>
            <ReservationForm />
          </div>
        </section>
      </main>
      <div className="home-footer-frame">
        <SiteFooter />
      </div>
    </div>
  );
}
