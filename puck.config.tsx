"use client";

import type { Config } from "@puckeditor/core";
import { SianyingPagePreview } from "@/components/admin/puck/SianyingPagePreview";
import { imageField } from "@/lib/puck/media-field";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";
import type { Project } from "@/lib/project-types";

export function createPuckEditorConfig(path: string, projects: Project[]) {
  const SianyingPageConfig = {
    label: "翔胤新版頁面內容",
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
      <SianyingPagePreview path={path} settings={props} projects={projects} />
    ),
  };

  return {
    components: { SianyingPage: SianyingPageConfig },
    categories: { pages: { title: "新版頁面內容", components: ["SianyingPage"] } },
  } as unknown as Config;
}

export {
  EDITABLE_PAGE_LABELS,
  EDITABLE_PAGE_PATHS,
  type EditablePagePath,
} from "@/lib/puck/editable-pages";

export default createPuckEditorConfig;
