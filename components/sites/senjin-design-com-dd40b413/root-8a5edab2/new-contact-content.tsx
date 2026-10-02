import Image from "next/image";

import { PageSupplements } from "@/components/cms/page-supplements";
import { company } from "@/data/siangyin";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

import { LineLogo } from "./line-logo";
import { NewContactForm } from "./new-contact-form";

export function NewContactContent({ settings }: { settings: SianyingPageSettings | null }) {
  return (
    <div className="new-contact-page">
      <section className="new-contact-identity">
        <h1>{settings?.eyebrow || "Connection"}</h1>
        <div>
          <p>{settings?.contactBrand || "SIANG YIN"}</p>
          <p>{settings?.contactService || "Design Consulting"}</p>
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
            <span>{settings?.contactFeatureLabel || "Selected Work"}</span>
            <strong>{settings?.contactFeatureTitle || "光域未來"}</strong>
          </figcaption>
        </figure>
      </section>

      <section className="new-contact-form-section">
        <h2>{settings?.title || "Contact"}</h2>
        <NewContactForm settings={settings} />
      </section>

      <address className="new-contact-address">
        <a href={settings?.contactMapHref || company.map} target="_blank" rel="noreferrer">
          {settings?.contactAddress || company.headquarters}
        </a>
        <a href={`tel:${(settings?.contactPhone || company.phone).replace(/\D/g, "")}`}>
          Tel：{settings?.contactPhone || company.phone}
        </a>
        <a href={settings?.contactLineHref || company.lineUrl} target="_blank" rel="noreferrer noopener">
          <LineLogo size={21} aria-hidden="true" />
          <span>LINE 官方帳號：{settings?.contactLine || company.line}</span>
        </a>
        <a href={`mailto:${settings?.contactEmail || company.email}`}>
          {settings?.contactEmail || company.email}
        </a>
      </address>
      <PageSupplements settings={settings} />
    </div>
  );
}
