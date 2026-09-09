import type { Data } from "@puckeditor/core";
import type { EditablePagePath } from "@/lib/puck/editable-pages";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

const seeds: Record<EditablePagePath, Omit<SianyingPageSettings, "sections">> = {
  "/": {
    eyebrow: "SIANG YIN / INTERIOR DESIGN",
    title: "翔胤室內設計",
    subtitle: "Design Consulting",
    description: "讓室內空間與生活密不可分",
    image: "/sites/senjin-design-com-dd40b413/root-8a5edab2/hero.jpg",
    imageAlt: "翔胤室內設計打造的明亮現代住宅空間",
    ctaLabel: "查看作品",
    ctaHref: "/new/projects/new",
  },
  "/new/about": {
    eyebrow: "ABOUT SIANG YIN",
    title: "Design Team",
    subtitle: "關於翔胤",
    description: "二十多年設計與工程經驗，讓設計回到日常。",
    image: "/media/grok-image-8edffe_orig-19da4d8d29.png",
    imageAlt: "翔胤室內設計團隊",
    ctaLabel: "與翔胤討論你的空間",
    ctaHref: "/new/contact",
  },
  "/new/blog": {
    eyebrow: "JOURNAL",
    title: "消息與媒體",
    subtitle: "Blog",
    description: "國際獎項、媒體採訪與翔胤設計消息。",
    image: "/media/adesignaward-certificate-136768.png",
    imageAlt: "翔胤室內設計獎項與媒體",
    ctaLabel: "聯絡翔胤",
    ctaHref: "/new/contact",
  },
  "/new/contact": {
    eyebrow: "Connection",
    title: "Contact",
    subtitle: "聯絡我們",
    description: "從一場對話，開始想像理想空間。",
    image: "",
    imageAlt: "",
    ctaLabel: "",
    ctaHref: "",
  },
  "/new/projects/new": {
    eyebrow: "NEW DESIGNS",
    title: "最新設計",
    subtitle: "New Designs",
    description: "翔胤最新住宅、商業空間與 3D 全景作品。",
    image: "",
    imageAlt: "",
    ctaLabel: "查看全部作品",
    ctaHref: "/new/projects/all",
  },
  "/new/projects/all": {
    eyebrow: "WORKS",
    title: "作品",
    subtitle: "All Projects",
    description: "從住宅、商業空間到建築更新，完整收錄翔胤的設計實踐。",
    image: "",
    imageAlt: "",
    ctaLabel: "聯絡翔胤",
    ctaHref: "/new/contact",
  },
  "/new/projects/residential": {
    eyebrow: "WORKS",
    title: "住宅空間",
    subtitle: "Residential",
    description: "以光、材質與生活動線，形塑貼近日常的住宅空間。",
    image: "",
    imageAlt: "",
    ctaLabel: "聯絡翔胤",
    ctaHref: "/new/contact",
  },
  "/new/projects/commercial": {
    eyebrow: "WORKS",
    title: "商業與特殊空間",
    subtitle: "Commercial",
    description: "從使用情境與品牌需求出發，建立清楚而耐用的空間秩序。",
    image: "",
    imageAlt: "",
    ctaLabel: "聯絡翔胤",
    ctaHref: "/new/contact",
  },
};

export function createPageSeed(path: EditablePagePath): Data {
  return {
    content: [
      {
        type: "SianyingPage",
        props: { id: `page-${path.replace(/\W+/g, "-") || "home"}`, ...seeds[path], sections: [] },
      },
    ],
    root: { props: {} },
  };
}

export function getAllPageSeeds(): Record<EditablePagePath, Data> {
  return Object.fromEntries(
    Object.keys(seeds).map((path) => [path, createPageSeed(path as EditablePagePath)]),
  ) as Record<EditablePagePath, Data>;
}
