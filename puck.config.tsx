"use client";

import type { Config } from "@puckeditor/core";
import { imageField } from "@/lib/puck/media-field";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

const SianyingPageConfig = {
  label: "翔胤頁面內容",
  fields: {
    eyebrow: { type: "text", label: "英文小標" },
    title: { type: "text", label: "主標題" },
    subtitle: { type: "text", label: "副標題／英文標題" },
    description: { type: "textarea", label: "頁面說明" },
    image: imageField,
    imageAlt: { type: "text", label: "圖片替代文字" },
    ctaLabel: { type: "text", label: "按鈕文字" },
    ctaHref: { type: "text", label: "按鈕連結" },
    sections: {
      type: "array",
      label: "補充圖文區塊",
      getItemSummary: (item: { title?: string }) => item.title || "未命名區塊",
      arrayFields: {
        id: { type: "text", label: "區塊 ID" },
        title: { type: "text", label: "標題" },
        body: { type: "textarea", label: "內文" },
        image: imageField,
        imageAlt: { type: "text", label: "圖片替代文字" },
        linkLabel: { type: "text", label: "連結文字" },
        linkHref: { type: "text", label: "連結網址" },
      },
      defaultItemProps: {
        id: "section",
        title: "新圖文區塊",
        body: "請輸入內容",
        image: "",
        imageAlt: "",
        linkLabel: "",
        linkHref: "",
      },
    },
  },
  defaultProps: {
    eyebrow: "SIANG YIN",
    title: "翔胤室內設計",
    subtitle: "Interior Design",
    description: "讓室內空間與生活密不可分",
    image: "",
    imageAlt: "",
    ctaLabel: "",
    ctaHref: "",
    sections: [],
  },
  render: (props: SianyingPageSettings) => (
    <main style={{ minHeight: "100vh", padding: "64px", background: "#e9dfd1", color: "#1d1d1d" }}>
      <p style={{ letterSpacing: ".18em", fontSize: 12 }}>{props.eyebrow}</p>
      <h1 style={{ fontFamily: "serif", fontSize: 56, margin: "18px 0 8px" }}>{props.title}</h1>
      <h2 style={{ fontWeight: 400, fontSize: 22, margin: 0 }}>{props.subtitle}</h2>
      <p style={{ maxWidth: 720, lineHeight: 1.9 }}>{props.description}</p>
      {props.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={props.image} alt={props.imageAlt} style={{ width: "100%", maxHeight: 520, objectFit: "cover", marginTop: 32 }} />
      ) : null}
      {props.sections.map((section) => (
        <section key={section.id} style={{ borderTop: "1px solid #777", marginTop: 48, paddingTop: 32 }}>
          <h2>{section.title}</h2>
          <p style={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>{section.body}</p>
          {section.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={section.image} alt={section.imageAlt} style={{ width: "100%", maxHeight: 460, objectFit: "cover" }} />
          ) : null}
        </section>
      ))}
    </main>
  ),
};

export const puckEditorConfig = {
  components: { SianyingPage: SianyingPageConfig },
  categories: { pages: { title: "頁面內容", components: ["SianyingPage"] } },
} as unknown as Config;

export {
  EDITABLE_PAGE_LABELS,
  EDITABLE_PAGE_PATHS,
  type EditablePagePath,
} from "@/lib/puck/editable-pages";

export default puckEditorConfig;
