import type { Metadata } from "next";
import { MotionDirector } from "../components/MotionDirector";
import { PageHero } from "../components/PageHero";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { contact } from "../data";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "翔胤室內設計官方網站隱私權保護政策。",
  alternates: { canonical: "/privacy" },
};

const privacySections = [
  {
    title: "一、個人資料蒐集方式",
    paragraphs: [
      "當您使用本網站之聯絡表單、來電諮詢、LINE 聯繫、預約諮詢或其他服務時，本網站可能會蒐集您的姓名、電話、電子郵件、裝修需求、地區等資訊，作為提供室內設計、裝修工程、老屋翻新及相關服務聯繫使用。",
    ],
  },
  {
    title: "二、個人資料使用目的",
    paragraphs: [
      "本網站蒐集之個人資料，將使用於提供室內設計、裝修工程與相關服務之聯繫及報價，回覆客戶問題與需求諮詢，客戶服務與售後聯繫，行銷推廣與廣告分析，以及提供最新活動、案例分享與服務資訊。",
    ],
  },
  {
    title: "三、廣告與再行銷服務說明",
    paragraphs: [
      "本網站可能使用 Google Ads、Google Analytics、Meta（Facebook / Instagram）等第三方廣告與分析服務，以提升網站服務品質與行銷效益。",
      "當您瀏覽本網站時，第三方平台可能透過 Cookie 或類似技術紀錄您的瀏覽行為，作為廣告投放、再行銷與優化廣告內容之參考。本網站可能依據使用者瀏覽過之頁面、點擊紀錄或互動行為，於 Google、Facebook、Instagram、YouTube 或其他合作平台顯示相關室內設計與裝修服務廣告。",
    ],
  },
  {
    title: "四、Cookie 使用說明",
    paragraphs: [
      "為提供更佳的網站體驗，本網站可能使用 Cookie 技術記錄使用者偏好與瀏覽行為。您可透過瀏覽器設定限制或關閉 Cookie 功能，但可能影響部分網站功能正常運作。",
    ],
  },
  {
    title: "五、資料保護與安全",
    paragraphs: [
      "本網站將採取合理之技術與管理措施，保護您的個人資料不被未經授權之存取、洩漏、竄改或毀損。",
    ],
  },
  {
    title: "六、第三方網站連結",
    paragraphs: [
      "本網站可能包含其他網站之連結，相關網站不適用本隱私權政策，請參閱該網站之隱私權說明。",
    ],
  },
  {
    title: "七、隱私權政策修訂",
    paragraphs: [
      "本網站保留隨時修改本隱私權政策之權利，修改後將公告於本網站，不另行個別通知。",
    ],
  },
  {
    title: "八、聯絡方式",
    paragraphs: [
      `如您對本隱私權政策有任何疑問，歡迎聯繫翔胤室內設計有限公司。電話 ${contact.phone}，電子郵件 ${contact.email}，公司地址 ${contact.headquarters}。`,
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main>
        <PageHero
          kicker="網站使用說明"
          title="隱私權政策"
          summary="本頁說明網站蒐集哪些資料、使用目的、Cookie 與聯絡方式。"
          image="/media/1484114617-f00649f99b.jpg"
          imageAlt="翔胤室內設計規劃的安靜居住空間"
        />

        <section className="privacy-intro content-shell" data-reveal>
          <p>
            歡迎瀏覽翔胤室內設計官方網站。為了讓您安心使用本網站所提供之各項服務與資訊，特此說明本網站的隱私權保護政策，以保障您的權益。
          </p>
        </section>

        <section className="privacy-list content-shell">
          {privacySections.map((section) => (
            <article key={section.title} data-reveal>
              <h2>{section.title}</h2>
              <div>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
