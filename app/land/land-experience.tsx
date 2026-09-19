"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  ChatCircleDots,
  Medal,
  PhoneCall,
} from "@phosphor-icons/react";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { LineLogo } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/line-logo";
import { assetRoot, company } from "@/data/siangyin";
import { saveInquiry } from "@/lib/inquiries/client";

import styles from "./land.module.css";

const projectShots = [
  {
    src: `${assetRoot}/projects/project-02.webp`,
    title: "御光境",
    detail: "柔和採光 × 低彩度客廳",
  },
  {
    src: `${assetRoot}/projects/project-05.webp`,
    title: "金鈺閤",
    detail: "系統收納 × 開放餐廚",
  },
  {
    src: `${assetRoot}/projects/project-09.webp`,
    title: "湖畔衫色",
    detail: "北歐色彩 × 完整機能",
  },
] as const;

function track(eventName: string, parameters?: Record<string, string>) {
  const browserWindow = window as Window & {
    gtag?: (command: "event", event: string, payload?: Record<string, string>) => void;
  };
  browserWindow.gtag?.("event", eventName, parameters);
}

export function LandExperience() {
  const startedAtRef = useRef(0);
  const submittingRef = useRef(false);
  const qualificationStartedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formIsVisible, setFormIsVisible] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    track("land_view", { page_type: "ad_landing" });

    const formSection = document.querySelector("#consultation");
    if (!formSection) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormIsVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(formSection);
    return () => observer.disconnect();
  }, []);

  function trackCta(position: string) {
    track("land_consultation_click", { position });
  }

  function trackLine(position: string) {
    track("land_line_click", { position });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setStatus("submitting");
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const homeType = value("homeType");
    const message = [
      `空間類型：${homeType || "未填寫"}`,
      `期待預算：${value("budget") || "未填寫"}`,
      `需求說明：${value("message") || "未填寫"}`,
    ].join("\n");

    try {
      await saveInquiry({
        formType: "consultation",
        name: value("name"),
        phone: value("phone"),
        location: value("location"),
        budget: value("budget"),
        projectType: homeType || "住宅空間",
        message,
        sourcePath: window.location.pathname,
        submittedAt: startedAtRef.current,
        website: value("website"),
      });
      form.reset();
      setStatus("success");
      startedAtRef.current = Date.now();
      track("land_form_success", { form_type: "free_site_visit" });
    } catch {
      setStatus("error");
      track("land_form_error", { form_type: "free_site_visit" });
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="land-title">
        <Image
          className={styles.heroImage}
          src={`${assetRoot}/projects/project-02.webp`}
          alt="翔胤室內設計打造的明亮北歐風客廳"
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroShade} />
        <header className={styles.heroHeader}>
          <Image
            src={`${assetRoot}/brand/logo.png`}
            alt="翔胤室內設計"
            width={48}
            height={48}
            priority
          />
          <span>翔胤室內設計</span>
          <a
            href={`tel:${company.phone.replaceAll(" ", "")}`}
            aria-label={`撥打電話 ${company.phone}`}
            onClick={() => track("land_phone_click", { position: "hero" })}
          >
            <PhoneCall aria-hidden="true" />
          </a>
        </header>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>北歐風設計 × 系統櫃整合</p>
          <h1 id="land-title">
            平價北歐風，
            <br />
            也能快速完成。
          </h1>
          <p className={styles.heroSummary}>
            以系統櫃整合收納、設計與施工，快速安排到場免費會勘，七日內提供初步預算。
          </p>
          <a
            className={styles.heroCta}
            href="#consultation"
            onClick={() => trackCta("hero")}
          >
            <span>預約免費會勘</span>
            <ArrowDown aria-hidden="true" />
          </a>
          <div className={styles.heroProof} aria-label="服務重點">
            <span>免費到場會勘</span>
            <span>7 日內初步預算</span>
            <span>國際獎項肯定</span>
          </div>
        </div>
      </section>

      <section className={styles.promise} aria-labelledby="promise-title">
        <p className={styles.sectionLabel}>快速裝修，不將就</p>
        <h2 id="promise-title">想快一點入住，<br />不代表要犧牲設計。</h2>
        <p className={styles.lead}>
          系統櫃不是把家做得一模一樣。我們先梳理動線、收納與生活習慣，再用可控的模組加快工程節奏。
        </p>
        <div className={styles.promiseRows}>
          <article>
            <div>
              <h3>預算先說清楚</h3>
              <p>完成現場需求盤點後，七日內提供初步預算方向。</p>
            </div>
          </article>
          <article>
            <div>
              <h3>系統櫃縮短工序</h3>
              <p>整合收納尺寸與空間設計，減少現場反覆修改。</p>
            </div>
          </article>
          <article>
            <div>
              <h3>好看也要好住</h3>
              <p>保留北歐風的清爽與光感，機能則回到你的真實生活。</p>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.feature} aria-label="翔胤系統櫃整合設計">
        <div className={styles.featureImage}>
          <Image
            src={`${assetRoot}/projects/project-05.webp`}
            alt="整合系統收納與餐廚機能的住宅作品"
            fill
            sizes="(max-width: 720px) 100vw, 55vw"
          />
        </div>
        <div className={styles.featureCopy}>
          <p className={styles.sectionLabel}>加快裝修的做法</p>
          <h2>從設計到系統櫃，<br />由同一套需求出發。</h2>
          <p>
            設計、收納與施工不各自為政，空間更完整，溝通也更直接。適合希望掌握時程與預算，又不想放棄質感的你。
          </p>
          <a href="#consultation" onClick={() => trackCta("system-cabinet")}>預約免費會勘 <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className={styles.portfolio} aria-labelledby="portfolio-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionLabel}>真實完工作品</p>
            <h2 id="portfolio-title">不是示意圖，<br />都是完工作品。</h2>
          </div>
          <p>滑動看看翔胤如何把採光、收納與居家尺度放進同一個畫面。</p>
        </div>
        <div className={styles.projectRail}>
          {projectShots.map((project) => (
            <article key={project.title} className={styles.projectCard}>
              <div className={styles.projectImage}>
                <Image
                  src={project.src}
                  alt={`${project.title}住宅設計作品`}
                  fill
                  sizes="(max-width: 720px) 82vw, 31vw"
                />
              </div>
              <span>{project.title}</span>
              <p>{project.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.award} aria-labelledby="award-title">
        <div className={styles.awardVisual}>
          <Image
            src={`${assetRoot}/editorial/award-trophy.png`}
            alt="翔胤室內設計獲得的 A' Design Award 國際設計獎座"
            fill
            sizes="(max-width: 720px) 100vw, 48vw"
          />
        </div>
        <div className={styles.awardCopy}>
          <Medal aria-hidden="true" />
          <p className={styles.sectionLabel}>國際設計肯定</p>
          <h2 id="award-title">國際獎項肯定，<br />也落實在日常裡。</h2>
          <p>
            翔胤室內設計榮獲 2021–2022 A’ Design Award 國際設計大獎。獲獎不只是形式，而是對比例、材質與使用細節的長期要求。
          </p>
          <a
            href="https://competition.adesignaward.com/design.php?ID=136768"
            target="_blank"
            rel="noreferrer"
          >
            查看獲獎作品 <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <p className={styles.sectionLabel}>免費會勘流程</p>
        <h2 id="process-title">不用先懂裝修，<br />把需求交給我們就好。</h2>
        <ol>
          <li>
            <span>01</span>
            <div><strong>填寫需求</strong><p>留下空間地點、類型與方便聯絡的方式。</p></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>免費到場會勘</strong><p>了解屋況、尺寸、收納與風格需求。</p></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>七日內初步預算</strong><p>提供規劃方向與預算輪廓，再決定下一步。</p></div>
          </li>
        </ol>
      </section>

      <section className={styles.consultation} id="consultation" aria-labelledby="consultation-title">
        <div className={styles.consultationIntro}>
          <p className={styles.sectionLabel}>免費到場會勘</p>
          <h2 id="consultation-title">安排免費會勘，<br />讓新家開始有輪廓。</h2>
          <p>填寫後由翔胤團隊與你聯絡，確認方便的會勘時間。也可以直接從 LINE 詢問。</p>
          <a
            className={styles.lineLink}
            href={company.lineUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackLine("form")}
          >
            <LineLogo size={22} weight="bold" aria-hidden="true" />
            LINE@ {company.line}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onFocusCapture={() => {
            if (qualificationStartedRef.current) return;
            qualificationStartedRef.current = true;
            track("land_form_start", { form_type: "free_site_visit" });
          }}
        >
          <label>
            <span>姓名 *</span>
            <input name="name" autoComplete="name" required maxLength={80} placeholder="怎麼稱呼您？" />
          </label>
          <label>
            <span>聯絡電話 *</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              minLength={8}
              maxLength={20}
              placeholder="09xx xxx xxx"
            />
          </label>
          <label>
            <span>空間地點 *</span>
            <input name="location" autoComplete="street-address" required maxLength={100} placeholder="例如：新北市五股區" />
          </label>
          <div className={styles.formSplit}>
            <label>
              <span>空間類型</span>
              <select name="homeType" defaultValue="新成屋">
                <option>新成屋</option>
                <option>中古屋／舊屋翻新</option>
                <option>預售屋客變</option>
                <option>局部裝修</option>
                <option>其他</option>
              </select>
            </label>
            <label>
              <span>期待預算</span>
              <select name="budget" defaultValue="尚未確定">
                <option>尚未確定</option>
                <option>100 萬以內</option>
                <option>100–200 萬</option>
                <option>200–300 萬</option>
                <option>300 萬以上</option>
              </select>
            </label>
          </div>
          <label>
            <span>想先告訴我們的事</span>
            <textarea name="message" rows={4} maxLength={1200} placeholder="坪數、屋況、預計入住時間或喜歡的風格…" />
          </label>
          <label className={styles.honeypot} aria-hidden="true">
            <span>網站</span>
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" disabled={status === "submitting" || status === "success"}>
            {status === "submitting" ? "正在送出…" : status === "success" ? "需求已送出" : "送出免費會勘需求"}
            {status === "success" ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
          <p className={styles.formStatus} aria-live="polite">
            {status === "success" && "已收到你的資料，我們會儘快與你聯絡。"}
            {status === "error" && "送出時發生問題，請改用 LINE 或電話與我們聯絡。"}
          </p>
          <small>送出即同意翔胤室內設計為本次諮詢目的聯絡您，不會用於其他行銷用途。</small>
        </form>
      </section>

      <footer className={styles.footer}>
        <Image src={`${assetRoot}/brand/logo.png`} alt="" width={52} height={52} />
        <div>
          <strong>{company.name}</strong>
          <span>{company.phone} · {company.headquarters}</span>
        </div>
      </footer>

      <nav
        className={`${styles.stickyCta} ${formIsVisible ? styles.stickyCtaHidden : ""}`}
        aria-label="快速聯絡"
        aria-hidden={formIsVisible}
      >
        <a
          className={styles.stickyLine}
          href={company.lineUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackLine("sticky")}
        >
          <ChatCircleDots aria-hidden="true" />
          LINE 詢問
        </a>
        <a href="#consultation" onClick={() => trackCta("sticky")}>
          預約免費會勘 <ArrowRight aria-hidden="true" />
        </a>
      </nav>
    </main>
  );
}
