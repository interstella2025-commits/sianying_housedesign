import type { Metadata } from "next";
import { MotionDirector } from "../components/MotionDirector";
import { PageHero } from "../components/PageHero";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { contact } from "../data";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "翔胤室內設計官方網站隱私權保護政策。",
};

const privacySections = [
  {
    title: "一、個人資料的取得方式",
    paragraphs: [
      "當您透過電話、LINE 或電子郵件與我們聯絡時，我們可能取得您主動提供的姓名、電話、電子郵件、裝修地點與裝修需求等資料，並用於後續聯絡及提供服務。",
      "網站預約表單只用來整理預約內容並開啟 LINE。本網站不會儲存您在表單中填寫的資料。",
    ],
  },
  {
    title: "二、個人資料的使用目的",
    paragraphs: [
      "我們可能將取得的個人資料用於以下事項：",
    ],
    list: [
      "回覆問題與裝修需求。",
      "提供室內設計、裝修工程與相關服務。",
      "提供報價、客戶服務及售後聯絡。",
      "在取得同意後，提供活動、案例與服務資訊。",
    ],
  },
  {
    title: "三、廣告與分析服務",
    paragraphs: [
      "本網站可能使用 Google Ads、Google Analytics 及 Meta（Facebook、Instagram）等第三方廣告與分析服務，以了解網站使用情況並改善廣告內容。",
      "第三方平台可能透過 Cookie 或類似技術記錄瀏覽與互動情況，並在 Google、Facebook、Instagram、YouTube 或其他合作平台顯示相關廣告。",
    ],
  },
  {
    title: "四、Cookie",
    paragraphs: [
      "本網站可能使用 Cookie 記錄使用偏好與瀏覽情況。您可以在瀏覽器中限制或停用 Cookie，但部分網站功能可能因此無法正常使用。",
    ],
  },
  {
    title: "五、資料安全",
    paragraphs: [
      "我們會採取合理的技術與管理措施，避免個人資料遭到未經授權的存取、洩漏、竄改或毀損。",
    ],
  },
  {
    title: "六、第三方網站連結",
    paragraphs: [
      "本網站可能包含第三方網站連結。第三方網站有各自的隱私權政策，不適用本政策。",
    ],
  },
  {
    title: "七、政策修訂",
    paragraphs: [
      "本政策如有修改，將公布於本網站，不另行個別通知。",
    ],
  },
  {
    title: "八、聯絡方式",
    paragraphs: [
      "如對本政策有任何疑問，請聯絡翔胤室內設計有限公司。",
    ],
    contact: true,
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main>
        <PageHero
          kicker="隱私權政策"
          title="隱私權政策"
          summary="本政策說明本網站蒐集、使用與保護個人資料的方式。"
          image="/media/1484114617-f00649f99b.jpg"
          imageAlt="翔胤室內設計規劃的安靜居住空間"
        />

        <section className="privacy-list content-shell">
          {privacySections.map((section) => (
            <article key={section.title} data-reveal>
              <h2>{section.title}</h2>
              <div>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {"list" in section && section.list ? (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {"contact" in section && section.contact ? (
                  <ul>
                    <li>電話：{contact.phone}</li>
                    <li>電子郵件：{contact.email}</li>
                    <li>公司地址：{contact.headquarters}</li>
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
