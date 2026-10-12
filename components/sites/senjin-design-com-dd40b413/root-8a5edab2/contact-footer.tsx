"use client";

import {
  FacebookLogo,
  InstagramLogo,
  MapPinLine,
  YoutubeLogo,
} from "@phosphor-icons/react";
import Image from "next/image";

import { assetRoot, company } from "@/data/siangyin";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

import { LineLogo } from "./line-logo";

export function ContactFooter({ settings }: { settings: SianyingPageSettings | null }) {
  const mapHref = settings?.footerMapHref || company.map;
  const footerLinks = [
    { label: "Instagram", href: settings?.footerInstagramHref || company.instagram, Icon: InstagramLogo },
    { label: "Facebook", href: settings?.footerFacebookHref || company.facebook, Icon: FacebookLogo },
    { label: "YouTube", href: settings?.footerYoutubeHref || company.youtube, Icon: YoutubeLogo },
    { label: "LINE", href: settings?.footerLineHref || company.lineUrl, Icon: LineLogo },
    { label: "Google Maps", href: mapHref, Icon: MapPinLine },
  ] as const;
  const phone = settings?.footerPhone || company.phone;
  const email = settings?.footerEmail || company.email;

  return (
    <footer
      id="contact"
      className="section-anchor relative isolate flex min-h-[20rem] items-center overflow-hidden px-6 py-16 text-center"
    >
      <Image
        src={settings?.footerBackgroundImage || `${assetRoot}/projects/project-12.webp`}
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
          {settings?.footerTitle || "CONNECTION"}
        </h2>

        <address className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.72rem] leading-6 tracking-[0.04em] text-white/76 not-italic">
          <span>{settings?.footerCompanyName || company.name}</span>
          <span aria-hidden="true">｜</span>
          <a href={mapHref} target="_blank" rel="noreferrer noopener">
            {settings?.footerAddress || company.headquarters}
          </a>
          <span aria-hidden="true">｜</span>
          <a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a>
          <span aria-hidden="true">｜</span>
          <a href={`mailto:${email}`}>{email}</a>
        </address>

        <p className="mt-6 font-[family-name:var(--font-montserrat)] text-[0.58rem] tracking-[0.08em] text-white/58">
          © {new Date().getFullYear()} {settings?.footerEnglishName || company.englishName} · 統一編號 {settings?.footerCompanyId || company.companyId}
        </p>
      </div>
    </footer>
  );
}
