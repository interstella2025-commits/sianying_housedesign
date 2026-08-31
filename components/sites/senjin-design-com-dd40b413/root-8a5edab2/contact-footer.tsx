import Image from "next/image";

import { assetRoot, company } from "@/data/siangyin";

import { Reveal } from "./reveal";

const socialLinks = [
  ["Facebook", company.facebook],
  ["Instagram", company.instagram],
  ["YouTube", company.youtube],
  ["LINE", company.lineUrl],
] as const;

export function ContactFooter() {
  return (
    <footer id="contact" className="section-anchor bg-[#111]">
      <section className="relative isolate min-h-[430px] overflow-hidden border-y border-[var(--line)] md:min-h-[520px]">
        <Image
          src={`${assetRoot}/projects/project-05.webp`}
          alt="翔胤室內設計作品金鈺閤的餐廚空間"
          fill
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-black/70" />
        <div className="site-container flex min-h-[430px] items-center md:min-h-[520px]">
          <Reveal>
            <p className="eyebrow mb-7 text-[var(--paper-soft)]">START A PROJECT</p>
            <h2 className="max-w-3xl text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.28] tracking-[0.06em]">
              與我們聊聊
              <br />
              你的空間
            </h2>
            <a
              href={company.lineUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-12 inline-flex min-h-12 items-center gap-8 border-b border-[var(--paper)] pb-2 text-sm tracking-[0.12em] transition-[gap,color] duration-300 hover:gap-11 hover:text-white"
            >
              LINE 線上諮詢 <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>
      </section>

      <div className="site-container py-16 md:py-20">
        <div className="grid gap-12 border-b border-[var(--line)] pb-14 sm:grid-cols-2 lg:grid-cols-[1.05fr_.9fr_1.5fr_.75fr] lg:gap-10">
          <div>
            <p className="text-xl tracking-[0.12em]">{company.name}</p>
            <p className="eyebrow mt-3 text-[var(--paper-soft)]">{company.englishName}</p>
          </div>

          <address className="not-italic">
            <p className="mb-5 text-sm tracking-[0.12em] text-[var(--paper-soft)]">聯絡</p>
            <a className="block py-1 text-sm hover:text-white" href={`tel:${company.phone.replaceAll("-", "")}`}>
              {company.phone}
            </a>
            <a className="block py-1 text-sm hover:text-white" href={`mailto:${company.email}`}>
              {company.email}
            </a>
            <a className="block py-1 text-sm hover:text-white" href={company.lineUrl} target="_blank" rel="noreferrer noopener">
              LINE {company.line}
            </a>
          </address>

          <div className="space-y-6 text-sm leading-7">
            <div>
              <p className="tracking-[0.12em] text-[var(--paper-soft)]">總公司</p>
              <p>{company.headquarters}</p>
            </div>
            <div>
              <p className="tracking-[0.12em] text-[var(--paper-soft)]">設計中心</p>
              <a href={company.map} target="_blank" rel="noreferrer noopener" className="border-b border-transparent pb-1 hover:border-[var(--paper)] hover:text-white">
                {company.designCenter}
              </a>
            </div>
          </div>

          <nav aria-label="社群連結" className="flex flex-col items-start gap-3">
            {socialLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="eyebrow min-h-7 border-b border-transparent py-1 hover:border-[var(--paper)] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[0.68rem] tracking-[0.1em] text-[var(--paper-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <p>統一編號 {company.companyId}</p>
        </div>
      </div>
    </footer>
  );
}
