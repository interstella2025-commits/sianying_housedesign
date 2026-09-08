import Link from "next/link";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

export function PageSupplements({ settings }: { settings: SianyingPageSettings | null }) {
  if (!settings?.sections?.length) return null;

  return (
    <div className="cms-page-sections">
      {settings.sections.map((section, index) => (
        <section className="cms-page-section" key={section.id || `${section.title}-${index}`}>
          {section.image ? (
            <div className="cms-page-section-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={section.image} alt={section.imageAlt || ""} loading="lazy" />
            </div>
          ) : null}
          <div className="cms-page-section-copy">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.linkLabel && section.linkHref ? (
              <Link href={section.linkHref}>{section.linkLabel} →</Link>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
