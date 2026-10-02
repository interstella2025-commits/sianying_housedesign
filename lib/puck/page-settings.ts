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

export type SianyingProjectCard = {
  projectSlug: string;
  title: string;
  english: string;
  description: string;
  cover: string;
};

export type SianyingEditorialStory = {
  title: string;
  image: string;
  imageAlt: string;
  date: string;
  category: "AWARD" | "PRESS";
  href: string;
};

export type SianyingLabelBody = {
  title: string;
  body: string;
};

export type SianyingTextItem = {
  text: string;
};

export type SianyingProcessItem = {
  number: string;
  title: string;
  text: string;
};

export type SianyingProjectSection = {
  slug: "residential" | "commercial" | "panorama" | "all";
  title: string;
  english: string;
  moreLabel: string;
  badge: string;
};

export type SianyingFormLabel = {
  name: "name" | "email" | "phone" | "houseAge" | "location" | "budget";
  label: string;
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
  projectCards?: SianyingProjectCard[];
  newsTitle?: string;
  stories?: SianyingEditorialStory[];
  aboutHistory?: string;
  aboutSecondaryDescription?: string;
  designerEyebrow?: string;
  designerLabel?: string;
  designerName?: string;
  designerBio?: SianyingTextItem[];
  philosophyTitle?: string;
  philosophyItems?: SianyingLabelBody[];
  awardEyebrow?: string;
  awardTitle?: string;
  awardName?: string;
  awardDescription?: string;
  awardImage?: string;
  awardImageAlt?: string;
  awardLinkLabel?: string;
  awardLinkHref?: string;
  serviceEyebrow?: string;
  serviceTitle?: string;
  processItems?: SianyingProcessItem[];
  blogSidebarTitle?: string;
  blogSidebarSubtitle?: string;
  blogCategoryTitle?: string;
  contactBrand?: string;
  contactService?: string;
  contactFeatureLabel?: string;
  contactFeatureTitle?: string;
  contactAddress?: string;
  contactMapHref?: string;
  contactPhone?: string;
  contactLine?: string;
  contactLineHref?: string;
  contactEmail?: string;
  contactFormLabels?: SianyingFormLabel[];
  contactMessageLabel?: string;
  contactTypeOptions?: SianyingTextItem[];
  projectSections?: SianyingProjectSection[];
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
    awardLinkHref: toPublicHref(settings.awardLinkHref ?? ""),
    contactMapHref: toPublicHref(settings.contactMapHref ?? ""),
    contactLineHref: toPublicHref(settings.contactLineHref ?? ""),
    sections: (settings.sections ?? []).map((section) => ({
      ...section,
      linkHref: toPublicHref(section.linkHref ?? ""),
    })),
  };
}
