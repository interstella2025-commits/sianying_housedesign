import type { Metadata } from "next";
import Image from "next/image";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { NewContactForm } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-contact-form";
import { company } from "@/data/siangyin";
import { getPageSettings } from "@/lib/cms/pages";
import { PageSupplements } from "@/components/cms/page-supplements";

export const metadata: Metadata = {
  title: "聯絡我們｜翔胤室內設計",
  description: "聯絡翔胤室內設計，預約空間丈量與設計需求討論。",
  alternates: { canonical: "/new/contact" },
};

export default async function NewContactPage() {
  const settings = await getPageSettings("/new/contact");
  return (
    <InnerPageShell tone="dark" showFooter={false}>
      <div className="new-contact-page">
        <section className="new-contact-identity">
          <h1>{settings?.eyebrow || "Connection"}</h1>
          <div>
            <p>SIANG YIN</p>
            <p>Design Consulting</p>
            <p>{settings?.description || company.philosophy}</p>
          </div>
          <figure className="new-contact-feature-image">
            <Image
              src={settings?.image || "/projects/project-01-1.png"}
              alt={settings?.imageAlt || "翔胤室內設計作品光域未來客廳空間"}
              fill
              priority
              sizes="(max-width: 760px) 0px, (max-width: 1100px) 38vw, 32vw"
            />
            <figcaption>
              <span>Selected Work</span>
              <strong>光域未來</strong>
            </figcaption>
          </figure>
        </section>

        <section className="new-contact-form-section">
          <h2>{settings?.title || "Contact"}</h2>
          <NewContactForm />
        </section>

        <address className="new-contact-address">
          <a href={company.map} target="_blank" rel="noreferrer">{company.headquarters}</a>
          <a href={`tel:${company.phone.replace(/\D/g, "")}`}>Tel：{company.phone}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </address>
        <PageSupplements settings={settings} />
      </div>
    </InnerPageShell>
  );
}
