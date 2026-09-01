import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { processItems } from "@/app/data";
import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { company } from "@/data/siangyin";

export const metadata: Metadata = {
  title: "關於翔胤｜翔胤室內設計",
  description: "翔胤室內設計成立於 2010 年，從格局、動線、材質與工程細節出發。",
  alternates: { canonical: "/new/about" },
};

export default function NewAboutPage() {
  return (
    <InnerPageShell tone="dark">
      <div className="new-about-page">
        <section id="designer" className="new-about-team">
          <h1>Design Team</h1>
          <div className="new-about-team-grid">
            <div className="new-about-portrait">
              <Image
                src="/media/grok-image-8edffe_orig-19da4d8d29.png"
                alt="翔胤室內設計專案設計師 Chou Su Zung"
                fill
                priority
                sizes="(max-width: 760px) 70vw, 24vw"
              />
            </div>

            <div className="new-about-team-copy">
              <nav aria-label="關於頁段落導覽">
                <a href="#designer">→ 設計師</a>
                <a href="#awards">→ 獎項</a>
                <a href="#service">→ 服務流程</a>
              </nav>
              <div>
                <p>{company.about}</p>
                <p>{company.philosophy}。設計從居住需求、動線與收納開始，再處理採光、材質與整體風格。</p>
                <p className="new-about-history">2010 台北成立 翔胤室內設計<br />20+ 年室內設計與工程實務<br />服務台北、新北、桃園、新竹、宜蘭與台中</p>
              </div>
            </div>
          </div>
        </section>

        <section className="new-about-designer-profile">
          <header>
            <p>Designer</p>
            <span>｜設計</span>
          </header>
          <div>
            <h2>Chou Su Zung</h2>
            <p>21 歲退伍後投入室內設計產業，累積超過二十年實務經驗，於 2010 年創立翔胤室內設計。</p>
            <p>以生活需求作為設計起點，讓格局、光線、材質與工程細節形成一致且可長久使用的空間。</p>
          </div>
        </section>

        <section id="awards" className="new-about-awards">
          <div className="new-about-award-media">
            <Image
              src="/media/adesignaward-certificate-136768.png"
              alt="翔胤室內設計 A' Design Award 得獎證書"
              fill
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          </div>
          <div>
            <p>Awards</p>
            <h2>｜獎項</h2>
            <strong>2022 — A&apos; Design Award</strong>
            <span>《鉑金石韻》室內空間及展覽設計類得獎作品</span>
            <a
              href="https://competition.adesignaward.com/design.php?ID=136768"
              target="_blank"
              rel="noreferrer"
            >
              查看官方得獎頁面 ↗
            </a>
          </div>
        </section>

        <section id="service" className="new-about-service">
          <header>
            <p>Service</p>
            <h2>｜服務流程</h2>
          </header>
          <ol>
            {processItems.map((item) => (
              <li key={item.number}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="new-about-contact-link">
          <Link href="/new/contact">與翔胤討論你的空間 →</Link>
        </div>
      </div>
    </InnerPageShell>
  );
}
