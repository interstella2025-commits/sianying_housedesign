import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "媒體採訪",
  description: "翔胤室內設計媒體專訪、設計觀點、作品報導與外部媒體收錄。",
};

const lineTodayUrl = "https://today.line.me/tw/v2/article/keVy7q";
const oneHundredUrl = "https://www.100.com.tw/5193";

export default function PressPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="press-page">
        <section className="press-hero">
          <div className="press-hero-copy">
            <p className="section-kicker" data-hero-kicker>媒體採訪 / Press</p>
            <h1>
              <span className="line-mask"><span data-hero-word>好的空間，</span></span>
              <span className="line-mask"><span data-hero-word>值得被說出來</span></span>
            </h1>
            <p data-hero-summary>從設計師的思考，到作品被媒體重新閱讀，收錄翔胤對空間與生活的長期觀察。</p>
            <a className="primary-button" href={lineTodayUrl} target="_blank" rel="noreferrer" data-reveal>
              閱讀 LINE TODAY 報導
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className="press-hero-media" data-hero-media data-parallax>
            <Image
              src="/media/myvideo_0312_111-be044f433c.jpg"
              alt="翔胤室內設計住宅空間媒體影像"
              fill
              priority
              unoptimized
              sizes="(max-width: 899px) 100vw, 62vw"
            />
          </div>
        </section>

        <section className="press-opening content-shell">
          <p data-reveal>媒體讓作品被更多人看見，我們更在意的是，設計背後的判斷有沒有被清楚理解</p>
          <div data-reveal>
            <span>翔胤設計 X 北歐制作</span>
            <p>從光線、材質、機能到工程細節，每一次受訪都回到同一件事：空間如何真正服務居住者。</p>
          </div>
        </section>

        <section className="press-feature content-shell">
          <div className="press-feature-media" data-wipe data-parallax>
            <Image
              src="/images/projects/platinum-stone/sjd-6699_2.png"
              alt="翔胤室內設計作品鉑金石韻"
              fill
              unoptimized
              sizes="(max-width: 899px) 100vw, 58vw"
            />
          </div>
          <article data-reveal>
            <div className="press-source"><span>LINE TODAY</span><span>Media feature</span></div>
            <h2>從作品出發，閱讀空間背後的想法</h2>
            <p>透過媒體視角，重新閱讀設計如何回應尺度、光線、材質與居住需求，讓作品不只停留在完成後的照片。</p>
            <a className="outline-button" href={lineTodayUrl} target="_blank" rel="noreferrer">
              前往原始報導
              <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
        </section>

        <section className="press-profile content-shell">
          <article data-reveal>
            <div className="press-source"><span>100 室內設計</span><span>Designer profile</span></div>
            <h2>二十年經驗，如何落到每個決定</h2>
            <p>設計師專頁收錄翔胤設計 X 北歐制作的最新作品與業主點評，也延伸閱讀設計總監對空間、預算與執行的觀點。</p>
            <a className="outline-button" href={oneHundredUrl} target="_blank" rel="noreferrer">
              查看設計師專頁
              <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
          <div className="press-profile-media" data-wipe data-parallax>
            <Image
              src="/images/projects/second-order-space/sjd-9831.png"
              alt="翔胤室內設計住宅作品"
              fill
              unoptimized
              sizes="(max-width: 899px) 100vw, 52vw"
            />
          </div>
        </section>

        <section className="press-statement content-shell" data-wipe>
          <p>Design in words</p>
          <h2>把專業說清楚，<br />也是一種設計</h2>
          <div>
            <p>好的設計不只需要好看的結果，也需要清楚說明為什麼這樣安排，以及每個選擇如何回應真正的生活。</p>
            <p>這裡會持續收錄媒體專訪、作品報導與翔胤對室內設計的觀察。</p>
          </div>
        </section>

        <section className="inner-page-cta content-shell" data-reveal>
          <p>Start a conversation</p>
          <h2>下一篇故事，<br />從你的空間開始</h2>
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
