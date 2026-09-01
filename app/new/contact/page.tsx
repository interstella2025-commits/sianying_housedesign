import type { Metadata } from "next";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { NewContactForm } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-contact-form";
import { company } from "@/data/siangyin";

export const metadata: Metadata = {
  title: "聯絡我們｜翔胤室內設計",
  description: "聯絡翔胤室內設計，預約空間丈量與設計需求討論。",
  alternates: { canonical: "/new/contact" },
};

export default function NewContactPage() {
  return (
    <InnerPageShell tone="dark" showFooter={false}>
      <div className="new-contact-page">
        <section className="new-contact-identity">
          <h1>Connection</h1>
          <div>
            <p>SIANG YIN</p>
            <p>Design Consulting</p>
            <p>{company.philosophy}</p>
          </div>
        </section>

        <section className="new-contact-form-section">
          <h2>Contact</h2>
          <NewContactForm />
        </section>

        <address className="new-contact-address">
          <a href={company.map} target="_blank" rel="noreferrer">{company.headquarters}</a>
          <a href={`tel:${company.phone.replace(/\D/g, "")}`}>Tel：{company.phone}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </address>
      </div>
    </InnerPageShell>
  );
}
