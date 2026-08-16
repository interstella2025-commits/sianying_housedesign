import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ExternalPopupLink } from "./components/ExternalPopupLink";
import { FilmPlayer } from "./components/FilmPlayer";
import { MotionDirector } from "./components/MotionDirector";
import { ProjectPresentation } from "./components/ProjectPresentation";
import { ReservationForm } from "./components/ReservationForm";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { contact, routes } from "./data";

const studioFacts = [
  { value: "2010", label: "SINCE", text: "翔胤室內設計成立" },
  { value: "20+", label: "EXPERIENCE", text: "超過 20 年設計經驗" },
  { value: "2022", label: "AWARD", text: "Iron A' Design Award 得獎" },
] as const;

const servicePreviewItems = [
  { title: "室內設計", english: "Interior Design" },
  { title: "裝修工程", english: "Renovation" },
  { title: "商業空間", english: "Commercial Space" },
  { title: "舊屋翻修", english: "Old House Renovation" },
  { title: "毛胚屋規劃", english: "Shell House Planning" },
] as const;

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
            <p className="home-hero-eyebrow" data-hero-kicker>
              RESIDENTIAL · COMMERCIAL · RENOVATION
            </p>
            <h1>
              <span className="line-mask">
                <span data-hero-word>讓空間與生活</span>
              </span>
              <span className="line-mask">
                <span data-hero-word>密不可分</span>
              </span>
            </h1>
            <p data-hero-summary>
              我們從居住需求、動線與收納開始，再處理採光、材質與整體風格。
            </p>
            <div className="home-hero-actions" data-hero-award>
              <Link className="primary-button home-hero-primary" href="#contact">
                預約丈量
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="home-hero-secondary" href={routes.works}>
                瀏覽完工作品
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <p className="home-hero-proof">SINCE 2010 · 2022 A&apos; DESIGN AWARD</p>
          </div>
        </section>

        <section className="studio-intro content-shell" data-reveal>
          <div className="studio-statement">
            <p className="studio-service-kicker">
              <span>SERVICES</span> / 服務內容
            </p>
            <p className="studio-statement-lead">
              我們提供住宅與商業
              <br />
              空間設計、裝修工程、
              <br />
              舊屋翻修及毛胚屋規劃
            </p>
            <p className="studio-statement-detail">
              空間規劃、設計繪圖、
              <br />
              工程施工與完工保固。
            </p>
            <Link className="studio-service-link" href={routes.services}>
              查看服務與收費
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="studio-facts">
            {studioFacts.map((fact) => (
              <div className="studio-fact" key={fact.label}>
                <strong className="studio-fact-value">{fact.value}</strong>
                <div className="studio-fact-meta">
                  <span className="studio-fact-label">{fact.label}</span>
                  <p className="studio-fact-text">{fact.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProjectPresentation />

        <section className="service-preview content-shell">
          <div className="service-preview-copy" data-reveal>
            <h2>
              從需求、報價到完工，
              <br />
              每個階段都有明確內容
            </h2>
            <div className="service-preview-copy__footer">
              <p>圖面、報價、工期與保固內容會在對應階段確認，方便掌握進度與預算。</p>
              <Link className="outline-button" href={routes.services}>
                查看服務與收費
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="service-preview-list" data-reveal>
            {servicePreviewItems.map((item, index) => (
              <div key={item.title}>
                <span className="service-preview-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="service-preview-label">
                  <small>{item.english}</small>
                  <strong>{item.title}</strong>
                </span>
                <ArrowRight aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section className="film-section content-shell" data-reveal>
          <FilmPlayer
            videoId={contact.featuredVideoId}
            poster={contact.featuredVideoPoster}
            title="心如境"
          />
          <div className="film-copy">
            <h2>心如境</h2>
            <p className="film-title">Serenity Within: When Space Reflects the Mind</p>
            <p>以自然採光、柔和色調與簡潔的材質配置，完成安靜且實用的住宅空間。</p>
            <ExternalPopupLink href={contact.youtube}>
              觀看更多影片
              <ArrowUpRight aria-hidden="true" />
            </ExternalPopupLink>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy" data-reveal>
            <p className="section-kicker">線上預約丈量</p>
            <h2>
              提供空間資訊，
              <br />
              我們與你確認需求
            </h2>
            <p>送出表單後，我們會與您聯絡並安排丈量。</p>
            <div className="contact-direct">
              <a href="tel:0222888123">{contact.phone}</a>
              <ExternalPopupLink href={contact.lineUrl}>
                LINE {contact.line}
              </ExternalPopupLink>
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
