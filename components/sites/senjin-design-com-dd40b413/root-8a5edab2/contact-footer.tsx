"use client";

import {
  ChatCircleDots,
  FacebookLogo,
  InstagramLogo,
  MapPinLine,
  YoutubeLogo,
} from "@phosphor-icons/react";
import Image from "next/image";

import { assetRoot, company } from "@/data/siangyin";

const footerLinks = [
  { label: "Instagram", href: company.instagram, Icon: InstagramLogo },
  { label: "Facebook", href: company.facebook, Icon: FacebookLogo },
  { label: "YouTube", href: company.youtube, Icon: YoutubeLogo },
  { label: "LINE", href: company.lineUrl, Icon: ChatCircleDots },
  { label: "Google Maps", href: company.map, Icon: MapPinLine },
] as const;

export function ContactFooter() {
  return (
    <footer
      id="contact"
      className="section-anchor relative isolate flex min-h-[20rem] items-center overflow-hidden px-6 py-16 text-center"
    >
      <Image
        src={`${assetRoot}/projects/project-12.webp`}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover grayscale"
      />
      <div className="absolute inset-0 -z-10 bg-black/85" />

      <div className="mx-auto w-full max-w-5xl">
        <nav aria-label="社群與聯絡連結" className="flex justify-center gap-5 text-white/82">
          {footerLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="transition-opacity hover:opacity-50"
            >
              <Icon aria-hidden="true" size={23} weight="regular" />
            </a>
          ))}
        </nav>

        <h2 className="mx-auto mt-8 w-fit border-b border-white/56 px-1 pb-3 font-[family-name:var(--font-montserrat)] text-sm font-light tracking-[0.42em] text-white/88">
          CONNECTION
        </h2>

        <address className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.72rem] leading-6 tracking-[0.04em] text-white/76 not-italic">
          <span>{company.name}</span>
          <span aria-hidden="true">｜</span>
          <a href={company.map} target="_blank" rel="noreferrer noopener">
            {company.headquarters}
          </a>
          <span aria-hidden="true">｜</span>
          <a href={`tel:${company.phone.replace(/\D/g, "")}`}>{company.phone}</a>
          <span aria-hidden="true">｜</span>
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </address>

        <p className="mt-6 font-[family-name:var(--font-montserrat)] text-[0.58rem] tracking-[0.08em] text-white/58">
          © {new Date().getFullYear()} {company.englishName} · 統一編號 {company.companyId}
        </p>
      </div>
    </footer>
  );
}
