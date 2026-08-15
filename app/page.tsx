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

const studioFacts = [
  { value: "2010", label: "SINCE", text: "翔胤室內設計成立" },
  { value: "20+", label: "EXPERIENCE", text: "超過 20 年設計經驗" },
  { value: "2022", label: "AWARD", text: "Iron A' Design Award 得獎" },
] as const;

export const metadata: Metadata = {
  title: "翔胤室內設計｜住宅、商業空間與舊屋翻修",
  description:
    "翔胤室內設計提供住宅與商業空間設計、裝修工程、舊屋翻修及毛胚屋規劃。",
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
                <span data-hero-word>讓空間與生活</span>
              </span>
              <span className="line-mask">
                <span data-hero-word>密不可分</span>
              </span>
            </h1>
            <p data-hero-summary>
              我們依照您的生活習慣，規劃格局、收納、採光與材質
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
              每一步都清清楚楚
            </h2>
            <div className="service-preview-copy__footer">
              <p>圖面、報價、工期與保固內容都清楚列出。</p>
              <Link className="outline-button" href={routes.services}>
                查看服務與收費
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
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
              本案以自然採光、柔和色調及簡潔的材質搭配，營造舒適、安定的居住環境。
            </p>
            <a href={contact.youtube} target="_blank" rel="noreferrer">
              觀看更多影片
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy" data-reveal>
            <p className="section-kicker">線上預約</p>
            <h2>預約丈量</h2>
            <p>
              填寫資料後，網站會開啟 LINE。請將預約內容傳送給我們，我們會儘快與您聯絡。
            </p>
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
