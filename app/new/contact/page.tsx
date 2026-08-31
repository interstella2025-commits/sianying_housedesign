import type { Metadata } from "next";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { company } from "@/data/siangyin";

export const metadata: Metadata = {
  title: "聯絡我們｜翔胤室內設計",
  description: "聯絡翔胤室內設計，預約空間丈量與設計需求討論。",
  alternates: { canonical: "/new/contact" },
};

const inputFields = [
  { name: "name", label: "姓名｜Name", type: "text" },
  { name: "email", label: "信箱｜E-mail", type: "email" },
  { name: "phone", label: "電話｜Phone", type: "tel" },
  { name: "houseAge", label: "屋齡｜House Age", type: "text" },
  { name: "location", label: "地區｜Location", type: "text" },
  { name: "budget", label: "預算｜Budget", type: "text" },
] as const;

export default function NewContactPage() {
  return (
    <InnerPageShell tone="dark">
      <div className="new-contact-page">
        <section className="new-contact-identity">
          <h1>Connection</h1>
          <div>
            <p>SIANG YIN</p>
            <p>Design Consulting</p>
            <p>{company.philosophy}</p>
          </div>
          <address>
            <a href={company.map} target="_blank" rel="noreferrer">{company.headquarters}</a>
            <a href={`tel:${company.phone.replaceAll("-", "")}`}>Tel：{company.phone}</a>
            <span>{company.designCenter}</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </address>
        </section>

        <section className="new-contact-form-section">
          <h2>Contact</h2>
          <form action={`mailto:${company.email}`} method="post" encType="text/plain">
            {inputFields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <input name={field.name} type={field.type} required={field.name === "name" || field.name === "phone"} />
              </label>
            ))}
            <label>
              <span>詢問類型｜Project Type</span>
              <select name="projectType" defaultValue="住宅空間">
                <option>住宅空間</option>
                <option>商業空間</option>
                <option>舊屋翻新</option>
                <option>新成屋</option>
                <option>預售屋客變</option>
                <option>其他</option>
              </select>
            </label>
            <label>
              <span>詢問｜Message</span>
              <textarea name="message" rows={7} />
            </label>
            <button type="submit">→ Submit</button>
          </form>
        </section>
      </div>
    </InnerPageShell>
  );
}
