"use client";

import { ArrowRight, Broom, Check, Factory, Hammer, ChatCircleDots, PhoneCall } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { LineLogo } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/line-logo";
import { assetRoot, company, projects as portfolioProjects } from "@/data/siangyin";
import { saveInquiry } from "@/lib/inquiries/client";

import styles from "./land.module.css";

const heroImage = "/images/projects/serenity-within/sjd-0060_orig.jpg";

const homeTypes = ["新成屋", "中古屋翻新", "預售屋客變", "局部裝修"] as const;
const budgets = ["100 萬內", "100–200 萬", "200–300 萬", "300 萬以上", "還不確定，想先諮詢"] as const;

const genericLineMessage = [
  "您好，我想諮詢裝修，了解免費到場會勘。",
  "",
  "空間類型：",
  "房屋所在地：",
  "大約坪數：",
  "期待預算：",
  "想裝修的項目：",
  "預計入住時間：",
  "",
  "姓名／稱呼：",
  "聯絡電話：",
].join("\n");

const genericLineUrl = `https://line.me/R/oaMessage/${encodeURIComponent(company.line)}/?${encodeURIComponent(genericLineMessage)}`;

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

  function openPrefilledLine(form: HTMLFormElement | null) {
    const data = form ? new FormData(form) : new FormData();
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const message = [
      "您好，我想諮詢裝修，了解免費到場會勘。",
      "",
      `空間類型：${value("homeType") || "請補充"}`,
      `房屋所在地：${value("location") || "請補充"}`,
      "大約坪數：請補充",
      `期待預算：${value("budget") || "請補充"}`,
      `想裝修的項目：${value("message") || "請補充"}`,
      "預計入住時間：請補充",
      "",
      `姓名／稱呼：${value("name") || "請補充"}`,
      `聯絡電話：${value("phone") || "請補充"}`,
    ].join("\n");
    const lineUrl = `https://line.me/R/oaMessage/${encodeURIComponent(company.line)}/?${encodeURIComponent(message)}`;
    trackLine("form_prefill");
    window.open(lineUrl, "_blank", "noopener,noreferrer");
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

    try {
      await saveInquiry({
        formType: "consultation",
        name: value("name"),
        phone: value("phone"),
        location: value("location"),
        budget: value("budget"),
        projectType: homeType,
        message: [`空間類型：${homeType}`, `期待預算：${value("budget")}`, `補充需求：${value("message") || "未填寫"}`].join("\n"),
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
        <div className={styles.heroVisual}>
          <Image src={heroImage} alt="翔胤室內設計暖白北歐風住宅完工作品" fill priority sizes="(min-width: 1440px) 100vw, (max-width: 720px) 100vw, 58vw" />
          <header className={styles.header}>
            <Link href="/" className={styles.brand} aria-label="返回翔胤室內設計首頁">
              <Image src={`${assetRoot}/brand/logo.png`} alt="翔胤室內設計" width={42} height={42} priority />
              <span>翔胤室內設計</span>
            </Link>
            <a className={styles.phoneLink} href={`tel:${company.phone.replaceAll(" ", "")}`} aria-label={`撥打 ${company.phone}`} onClick={() => track("land_phone_click", { position: "hero" })}>
              <PhoneCall aria-hidden="true" />
            </a>
          </header>
          <div className={styles.awardBadge}>A’ Design Award</div>
        </div>

        <div className={styles.heroOffer}>
          <p className={styles.offerLine}>新成屋裝潢・中古屋翻新</p>
          <h1 id="land-title"><span>國際得獎設計師</span><span>親自到場會勘</span><em>為你規劃平價北歐風</em></h1>
          <ul className={styles.heroBenefits}>
            <li><strong>免費到場會勘</strong></li>
            <li><strong>7 日內初步預算</strong></li>
            <li><strong>系統櫃整合施工</strong></li>
          </ul>
          <a href="#consultation" className={styles.primaryCta} onClick={() => trackCta("hero")}>
            <span>預約設計師免費會勘</span><ArrowRight aria-hidden="true" />
          </a>
          <div className={styles.heroTrust} aria-label="翔胤設計經驗與獎項">
            <span>20 年以上設計工程實務</span>
            <span>A’ Design Award 國際設計獎肯定</span>
          </div>
        </div>
      </section>

      <div className={styles.mobileJourney}>
      <section className={styles.audience} aria-labelledby="audience-title">
        <div className={styles.audienceIntro}>
          <p className={styles.eyebrow}>想裝修，卻不知道預算怎麼抓？</p>
          <h2 id="audience-title">設計師免費到場會勘<br />再幫你抓裝修預算</h2>
          <p className={styles.desktopLead}>不用先猜一個數字。先把屋況、收納與入住時間攤開來談，初步預算才有判斷依據。</p>
        </div>
        <div className={styles.audienceList}>
          <p><strong>先看屋況</strong><span>確認坪數、格局與現場條件，了解哪些需要處理、哪些可以保留。</span></p>
          <p><strong>再談需求</strong><span>想要多少收納、喜歡什麼風格、預計何時入住，把需求與期待預算一起說清楚。</span></p>
          <p><strong>整理初步預算</strong><span>依照屋況與需求，整理裝修方向及費用，7 日內提供初步預算，讓你有依據再決定。</span></p>
        </div>
      </section>

      <section className={styles.valueStory} aria-labelledby="value-story-title">
        <div className={styles.valueStoryIntro}>
          <p className={styles.eyebrow}>為什麼可以做得更平價</p>
          <h2 id="value-story-title">平價不減質感與設計</h2>
          <p className={styles.desktopLead}>系統櫃先在工廠製作，現場以安裝為主。少掉大量木作工時、裁切與清潔，預算更集中在真正影響使用與質感的地方。</p>
        </div>

        <div className={styles.valueFlow} aria-label="翔胤控制預算的方法">
          <article>
            <span className={styles.valueIcon}><Hammer aria-hidden="true" weight="light" /></span>
            <h3>少木工<br />省成本</h3>
            <p>縮短師傅現場製作時間</p>
          </article>
          <article>
            <span className={styles.valueIcon}><Factory aria-hidden="true" weight="light" /></span>
            <h3>工廠提前<br />製作</h3>
            <p>到場以安裝為主，速度更快</p>
          </article>
          <article>
            <span className={styles.valueIcon}><Broom aria-hidden="true" weight="light" /></span>
            <h3>少木屑<br />省清潔</h3>
            <p>減少裁切，也減少收尾費用</p>
          </article>
        </div>
      </section>

      <section className={styles.proof} aria-labelledby="proof-title">
        <div className={styles.sectionIntro}>
          <h2 id="proof-title">國際得獎設計師<br />為你設計有質感的家</h2>
          <p className={styles.desktopLead}>系統櫃負責效率，設計師負責比例、動線與材質。以下 12 件皆為翔胤實際完成作品。</p>
        </div>
        <div className={styles.projectRail}>
          {portfolioProjects.map((project) => (
            <article className={styles.project} key={project.number}>
              <Image src={project.image} alt={`${project.title}完工作品`} fill sizes="(max-width: 720px) 84vw, 32vw" />
              <div><strong>{project.title}</strong><span>{project.english}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.award} aria-labelledby="award-title">
        <div className={styles.awardImage}>
          <Image src={`${assetRoot}/editorial/award-trophy.png`} alt="翔胤室內設計 A’ Design Award 國際設計獎座" fill sizes="(max-width: 720px) 42vw, 30vw" />
        </div>
        <div className={styles.awardCopy}>
          <span>2021–2022</span>
          <h2 id="award-title">A&apos; Design Award<br />國際設計獎肯定</h2>
          <div className={styles.trustStats} aria-label="品牌經驗與服務">
            <div><strong>20+ 年</strong><span>設計工程實務</span></div>
            <div><strong>得獎設計師</strong><span>親自到場會勘</span></div>
          </div>
        </div>
        <div className={styles.awardDetails}>
          <strong>設計，不只停在圖面</strong>
          <p>20 年以上設計與工程實務，從空間規劃、系統櫃到現場施工，由同一團隊整合落實。</p>
          <dl>
            <div><dt>獎項</dt><dd>A&apos; Design Award</dd></div>
            <div><dt>年份</dt><dd>2021–2022</dd></div>
            <div><dt>服務</dt><dd>設計・系統櫃・施工</dd></div>
          </dl>
        </div>
      </section>

      <div className={styles.awardCta}>
        <a href="#consultation" className={styles.primaryCta} onClick={() => trackCta("award")}>
          <span>預約會勘，討論我家的設計</span><ArrowRight aria-hidden="true" />
        </a>
      </div>
      </div>

      <div className={styles.desktopJourney}>
        <section className={styles.desktopBudget} aria-labelledby="desktop-budget-title">
          <div className={styles.desktopBudgetIntro}>
            <p className={styles.eyebrow}>先看現場，再談裝修預算</p>
            <h2 id="desktop-budget-title">會勘之後<br />預算才有依據</h2>
            <p>坪數相同，屋況、收納與施作範圍不同，費用就不會一樣。由設計師親自到場，把需要處理與可以保留的地方先釐清。</p>
            <a href="#consultation" onClick={() => trackCta("desktop_budget")}>預約免費到場會勘 <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className={styles.desktopProcess}>
            <article><span>01</span><div><h3>先看屋況</h3><p>確認坪數、格局、採光與現場條件，了解哪些需要處理、哪些可以保留。</p></div><strong>現場條件</strong></article>
            <article><span>02</span><div><h3>再談需求</h3><p>收納、風格、入住時間與期待預算一次說清楚，避免做到一半才追加。</p></div><strong>生活需求</strong></article>
            <article><span>03</span><div><h3>整理初步預算</h3><p>依照屋況與需求整理裝修方向，7 日內提供初步預算，讓你有依據再決定。</p></div><strong>7 日內提供</strong></article>
          </div>
        </section>

        <section className={styles.desktopMethod} aria-labelledby="desktop-method-title">
          <div className={styles.desktopMethodImage}>
            <Image src={portfolioProjects[4].image} alt={`${portfolioProjects[4].title}系統櫃與空間整合作品`} fill sizes="46vw" />
            <span>翔胤實際完工作品</span>
          </div>
          <div className={styles.desktopMethodCopy}>
            <p className={styles.eyebrow}>平價不減質感與設計</p>
            <h2 id="desktop-method-title">把現場木作減少<br />把預算留給生活</h2>
            <p>翔胤以系統櫃整合設計與施工。櫃體先在工廠完成，現場以安裝為主，縮短木工製作時間，也減少裁切、木屑與收尾清潔。</p>
            <div className={styles.desktopMethodList}>
              <article><Hammer aria-hidden="true" weight="light" /><div><strong>省木工成本</strong><span>縮短師傅在現場製作的時間</span></div></article>
              <article><Factory aria-hidden="true" weight="light" /><div><strong>工廠提前製作</strong><span>尺寸確認後製作，到場直接安裝</span></div></article>
              <article><Broom aria-hidden="true" weight="light" /><div><strong>減少木屑清潔</strong><span>減少裁切與相應的收尾費用</span></div></article>
            </div>
          </div>
        </section>

        <section className={styles.desktopPortfolio} aria-labelledby="desktop-portfolio-title">
          <div className={styles.desktopPortfolioIntro}>
            <div><p className={styles.eyebrow}>12 件真實完工作品</p><h2 id="desktop-portfolio-title">國際得獎設計師<br />為你設計有質感的家</h2></div>
            <p>系統櫃負責效率，設計師負責比例、動線、材質與收納。以下皆為翔胤設計並完成施工的住宅空間。</p>
          </div>
          <div className={styles.desktopProjectGrid}>
            {portfolioProjects.map((project) => (
              <article className={styles.desktopProject} key={`desktop-${project.number}`}>
                <Image src={project.image} alt={`${project.title}完工作品`} fill sizes="(min-width: 1440px) 25vw, 33vw" />
                <div><strong>{project.title}</strong><span>{project.english}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.desktopAuthority} aria-labelledby="desktop-award-title">
          <div className={styles.desktopAuthorityImage}><Image src={`${assetRoot}/editorial/award-trophy.png`} alt="翔胤室內設計 A’ Design Award 國際設計獎座" fill sizes="240px" /></div>
          <div className={styles.desktopAuthorityCopy}>
            <span>2021–2022</span>
            <h2 id="desktop-award-title">A&apos; Design Award<br />國際設計獎肯定</h2>
            <p>20 年以上設計與工程實務。得獎設計師親自到場，從空間規劃、系統櫃到施工整合，讓設計真正落實在完成後的家。</p>
          </div>
          <div className={styles.desktopAuthorityFacts}>
            <div><strong>20+ 年</strong><span>設計工程實務</span></div>
            <div><strong>得獎設計師</strong><span>親自到場會勘</span></div>
            <div><strong>一站整合</strong><span>設計・系統櫃・施工</span></div>
            <a href="#consultation" onClick={() => trackCta("desktop_award")}>預約會勘，討論我家的設計 <ArrowRight aria-hidden="true" /></a>
          </div>
        </section>
      </div>

      <section className={styles.consultation} id="consultation" aria-labelledby="consultation-title">
        <div className={styles.formIntro}>
          <span>免費到場會勘</span>
          <h2 id="consultation-title">請留下資料<br />我們會盡快聯繫您</h2>
          <p className={styles.desktopLead}>不需要先準備完整裝修計畫。留下空間類型、預算與地點，我們會先確認需求，再安排會勘時間。</p>
          <ol className={styles.desktopSteps}>
            <li><span>01</span>填寫基本屋況</li>
            <li><span>02</span>團隊電話聯繫</li>
            <li><span>03</span>確認會勘時間</li>
          </ol>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} onFocusCapture={() => {
          if (qualificationStartedRef.current) return;
          qualificationStartedRef.current = true;
          track("land_form_start", { form_type: "free_site_visit" });
        }}>
          <fieldset>
            <legend>空間類型</legend>
            <div className={styles.choiceGrid}>
              {homeTypes.map((type, index) => (
                <label key={type}><input type="radio" name="homeType" value={type} defaultChecked={index === 0} /><span>{type}</span></label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>裝修預算</legend>
            <div className={styles.choiceGrid}>
              {budgets.map((budget, index) => (
                <label key={budget}><input type="radio" name="budget" value={budget} defaultChecked={index === budgets.length - 1} /><span>{budget}</span></label>
              ))}
            </div>
          </fieldset>
          <div className={styles.textFields}>
            <label><span>姓名 *</span><input name="name" autoComplete="name" required maxLength={80} placeholder="怎麼稱呼你" /></label>
            <label><span>聯絡電話 *</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={8} maxLength={20} placeholder="請填寫方便聯絡的手機號碼" /></label>
            <label><span>房屋所在地 *</span><input name="location" autoComplete="street-address" required maxLength={100} placeholder="例如：新北市五股區" /></label>
            <label><span>其他需求</span><textarea name="message" rows={3} maxLength={1200} placeholder="坪數、屋況、想裝修的項目，或預計入住時間" /></label>
          </div>
          <label className={styles.honeypot} aria-hidden="true"><span>網站</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
          <div className={styles.formActions}>
            <button className={styles.formSubmit} type="submit" disabled={status === "submitting" || status === "success"}>
              {status === "submitting" ? <span>需求送出中，<br />請稍候</span> : status === "success" ? <span>需求已送出</span> : <span>送出需求，<br />預約免費會勘</span>}
              {status === "success" ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
            </button>
            <button className={styles.linePrefill} type="button" onClick={(event) => openPrefilledLine(event.currentTarget.form)}>
              <LineLogo size={20} weight="bold" aria-hidden="true" />
              <span>用 LINE<br />聯絡</span>
            </button>
          </div>
          <div className={styles.formFeedback} aria-live="polite">
            {status === "success" && (
              <div><strong>已收到你的會勘需求</strong><p>翔胤團隊會儘快與你聯絡，確認裝修需求與方便的會勘時間，請留意來電。</p><a href={genericLineUrl} target="_blank" rel="noreferrer" onClick={() => trackLine("form_success")}>加入 LINE，傳送屋況照片</a></div>
            )}
            {status === "error" && (
              <div><strong>需求尚未送出</strong><p>請稍後再試，或透過 LINE、電話與我們聯絡。</p><span><a href={genericLineUrl} target="_blank" rel="noreferrer" onClick={() => trackLine("form_error")}>用 LINE 聯絡</a><a href={`tel:${company.phone.replaceAll(" ", "")}`}>撥打電話</a></span></div>
            )}
          </div>
          <small>資料僅用於本次裝修諮詢與聯絡。</small>
        </form>
      </section>

      <footer className={styles.footer}>
        <Image src={`${assetRoot}/brand/logo.png`} alt="" width={44} height={44} />
        <div><strong>{company.name}</strong><span>平價北歐風規劃｜設計・系統櫃・施工整合</span><a href={`tel:${company.phone.replaceAll(" ", "")}`}>{company.phone}</a><span>{company.headquarters}</span></div>
      </footer>

      <nav className={`${styles.stickyCta} ${formIsVisible ? styles.stickyCtaHidden : ""}`} aria-label="快速聯絡">
        <a href={genericLineUrl} target="_blank" rel="noreferrer" onClick={() => trackLine("sticky")}><ChatCircleDots aria-hidden="true" /> LINE 諮詢</a>
        <a href="#consultation" onClick={() => trackCta("sticky")}>免費會勘 <ArrowRight aria-hidden="true" /></a>
      </nav>
    </main>
  );
}
