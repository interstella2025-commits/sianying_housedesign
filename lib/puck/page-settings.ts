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

export function extractPageSettings(data: Data | null): SianyingPageSettings | null {
  const block = data?.content.find((item) => item.type === "SianyingPage");
  return block ? (block.props as unknown as SianyingPageSettings) : null;
}
