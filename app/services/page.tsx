import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { processItems, serviceGroups } from "../data";

export const metadata: Metadata = {
  title: "室內設計與裝修收費",
  description:
    "翔胤室內設計工作流程、設計製圖費、工程監管費與完整施工服務內容。",
};

const feeItems = [
  { number: "01", label: "設計製圖費", price: "3,000", unit: "元 / 坪", note: "含 2D 平面圖與立面圖" },
  { number: "02", label: "新成屋設計費", price: "3,500", unit: "元 / 坪", note: "含 3D 透視彩圖" },
  { number: "03", label: "舊屋翻新設計費", price: "4,000", unit: "元 / 坪", note: "含 3D 透視彩圖" },
  { number: "04", label: "工程監管費", price: "5–8", unit: "%", note: "依工程內容與現場條件評估" },
] as const;

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="services-page">
        <section className="service-story-hero">
          <div className="service-story-copy">
            <p className="section-kicker" data-hero-kicker>設計及收費 / Service &amp; Fees</p>
            <h1>
              <span className="line-mask">
                <span data-hero-word>設計流程</span>
              </span>
              <span className="line-mask">
                <span data-hero-word>與施工內容</span>
              </span>
            </h1>
            <p className="service-story-summary" data-hero-summary>
              從現場丈量、圖面與報價，到施工、驗收和保固，各階段的工作與費用均列在本頁。
            </p>
            <div className="service-hero-progress" data-reveal>
              <span>初次對話</span>
              <i aria-hidden="true" />
              <span>安心入住</span>
            </div>
          </div>

          <div className="service-story-visual" data-hero-media data-parallax>
            <Image
              src="/projects/project-05-1.png"
              alt="翔胤室內設計規劃的餐廚空間"
              fill
              priority
              unoptimized
              sizes="(max-width: 899px) 100vw, 62vw"
            />
            <div className="service-hero-counter" data-float-card>
              <span>設計到完工</span>
              <div><strong>01</strong><i>→</i><strong>09</strong></div>
            </div>
            <div className="service-hero-cutout">
              <div className="hero-notch-signature-copy">
                <span className="hero-notch-signature-kicker">Clear process</span>
                <strong>流程、文件與負責項目</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="rates-lab">
          <div className="rates-layout content-shell">
            <header className="rates-heading" data-reveal>
              <p className="section-kicker">費用基準 / Rates</p>
              <h2>設計與<br />工程費用</h2>
              <p>以下為基本計價方式；實際費用會依坪數、屋況、需求與施工內容確認。</p>
            </header>

            <div className="rate-board">
              {feeItems.map((item) => (
                <article key={item.number} className="rate-row" data-wipe>
                  <span className="rate-number">{item.number}</span>
                  <div className="rate-name">
                    <h3>{item.label}</h3>
                    <p>{item.note}</p>
                  </div>
                  <div className="rate-price">
                    <strong>{item.price}</strong>
                    <span>{item.unit}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="service-field">
          <div className="service-field-heading content-shell" data-reveal>
            <p className="section-kicker">服務範圍 / Scope</p>
            <h2>設計與施工<br />服務範圍</h2>
          </div>
          <div className="scope-showcase content-shell">
            {serviceGroups.map((group) => (
              <article key={group.title} data-reveal>
                <div className="scope-showcase-title">
                  <span>{group.english}</span>
                  <h3>{group.title}</h3>
                </div>
                <ol>
                  {group.items.map((item, itemIndex) => (
                    <li key={item.label}>
                      <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                      <strong>{item.label}</strong>
                      <em>{item.english}</em>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="process-journey">
          <div className="process-journey-layout content-shell">
            <header className="journey-heading">
              <p className="section-kicker">Process 01—09</p>
              <h2>從諮詢到<br />完工驗收</h2>
              <div className="journey-total" aria-hidden="true">09</div>
            </header>
            <ol className="journey-list">
              {processItems.map((item) => (
                <li key={item.number} data-process-step>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Contact</p>
          <h2>預約丈量與<br />需求討論</h2>
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
