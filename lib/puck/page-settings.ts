import type { Data } from "@puckeditor/core";

export type SianyingPageSection = {
  id: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  linkLabel: string;
  linkHref: string;
};

export type SianyingPageSettings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  sections: SianyingPageSection[];
};

function toPublicHref(href: string): string {
  if (href === "/new") return "/";
  return href.startsWith("/new/") ? href.slice(4) : href;
}

export function extractPageSettings(data: Data | null): SianyingPageSettings | null {
  const block = data?.content.find((item) => item.type === "SianyingPage");
  if (!block) return null;

  const settings = block.props as unknown as SianyingPageSettings;
  return {
    ...settings,
    ctaHref: toPublicHref(settings.ctaHref ?? ""),
    sections: (settings.sections ?? []).map((section) => ({
      ...section,
      linkHref: toPublicHref(section.linkHref ?? ""),
    })),
  };
}
