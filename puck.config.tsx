"use client";

import type { Config } from "@puckeditor/core";
import { SianyingPagePreview } from "@/components/admin/puck/SianyingPagePreview";
import { imageField } from "@/lib/puck/media-field";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";
import type { Project } from "@/lib/project-types";
import { getProjectsForCategory, type ProjectCategorySlug } from "@/app/lib/new-site-projects";

const categoryByPath: Partial<Record<string, ProjectCategorySlug>> = {
  "/new": "all",
  "/new/projects/new": "all",
  "/new/projects/all": "all",
  "/new/projects/residential": "residential",
  "/new/projects/commercial": "commercial",
};

export function createPuckEditorConfig(path: string, projects: Project[]) {
  const category = categoryByPath[path];
  const pageProjects = category ? getProjectsForCategory(category, projects) : [];
  const pageFields: Record<string, unknown> = {};
  const addTextField = (key: string, label: string, type: "text" | "textarea" = "text") => {
    pageFields[key] = { type, label };
  };

  if (path === "/new") {
    addTextField("eyebrow", "首屏英文小標");
    addTextField("title", "品牌主標題");
    addTextField("subtitle", "首屏英文副標");
    addTextField("description", "首屏動態文案", "textarea");
    pageFields.image = { ...imageField, label: "首屏背景圖片" };
    addTextField("imageAlt", "首屏圖片替代文字");
    addTextField("newsTitle", "News 區標題");
  } else if (path === "/new/about") {
    addTextField("title", "頁面主標題");
    addTextField("description", "品牌介紹", "textarea");
    pageFields.image = { ...imageField, label: "設計師照片" };
    addTextField("imageAlt", "設計師照片替代文字");
    addTextField("ctaLabel", "底部按鈕文字");
    addTextField("ctaHref", "底部按鈕連結");
    addTextField("aboutHistory", "照片下方經歷（每行一筆）", "textarea");
    addTextField("aboutSecondaryDescription", "品牌介紹第二段", "textarea");
    addTextField("designerEyebrow", "設計師區英文小標");
    addTextField("designerLabel", "設計師區中文小標");
    addTextField("designerName", "主持設計師標題");
    pageFields.designerBio = {
      type: "array",
      label: "設計師介紹段落",
      getItemSummary: (item: { text?: string }) => item.text?.slice(0, 24) || "新段落",
      arrayFields: { text: { type: "textarea", label: "段落文字" } },
      defaultItemProps: { text: "請輸入設計師介紹" },
    };
    addTextField("philosophyTitle", "設計理念標題");
    pageFields.philosophyItems = {
      type: "array",
      label: "設計理念",
      getItemSummary: (item: { title?: string }) => item.title || "新理念",
      arrayFields: {
        title: { type: "text", label: "理念標題" },
        body: { type: "textarea", label: "理念說明" },
      },
      defaultItemProps: { title: "新理念", body: "請輸入說明" },
    };
    addTextField("awardEyebrow", "獎項英文小標");
    addTextField("awardTitle", "獎項中文標題");
    addTextField("awardName", "獎項名稱");
    addTextField("awardDescription", "獎項說明", "textarea");
    pageFields.awardImage = { ...imageField, label: "獎項圖片" };
    addTextField("awardImageAlt", "獎項圖片替代文字");
    addTextField("awardLinkLabel", "獎項連結文字");
    addTextField("awardLinkHref", "獎項連結網址");
    addTextField("serviceEyebrow", "流程英文小標");
    addTextField("serviceTitle", "流程中文標題");
    pageFields.processItems = {
      type: "array",
      label: "服務流程（拖曳即可排序）",
      getItemSummary: (item: { number?: string; title?: string }) =>
        `${item.number || ""} ${item.title || "新流程"}`.trim(),
      arrayFields: {
        number: { type: "text", label: "編號" },
        title: { type: "text", label: "流程標題" },
        text: { type: "textarea", label: "流程說明" },
      },
      defaultItemProps: { number: "10", title: "新流程", text: "請輸入流程說明" },
    };
  } else if (path === "/new/blog") {
    addTextField("eyebrow", "英文小標");
    addTextField("title", "主標題");
    addTextField("subtitle", "副標題／英文標題");
    addTextField("description", "頁面說明", "textarea");
    addTextField("blogSidebarTitle", "文章區中文標題");
    addTextField("blogSidebarSubtitle", "文章區英文標題");
    addTextField("blogCategoryTitle", "分類標題");
  } else if (path === "/new/contact") {
    addTextField("eyebrow", "頁面英文主標");
    addTextField("title", "表單區標題");
    addTextField("description", "聯絡頁介紹", "textarea");
    pageFields.image = { ...imageField, label: "精選作品圖片" };
    addTextField("imageAlt", "精選作品替代文字");
    addTextField("contactBrand", "品牌英文名稱");
    addTextField("contactService", "服務英文名稱");
    addTextField("contactFeatureLabel", "精選作品小標");
    addTextField("contactFeatureTitle", "精選作品名稱");
    addTextField("contactAddress", "地址");
    addTextField("contactMapHref", "地圖連結");
    addTextField("contactPhone", "電話");
    addTextField("contactLine", "LINE 帳號");
    addTextField("contactLineHref", "LINE 連結");
    addTextField("contactEmail", "Email");
    pageFields.contactFormLabels = {
      type: "array",
      label: "表單欄位名稱",
      getItemSummary: (item: { label?: string }) => item.label || "未命名欄位",
      arrayFields: {
        name: {
          type: "select",
          label: "欄位",
          options: [
            { label: "姓名", value: "name" },
            { label: "信箱", value: "email" },
            { label: "電話", value: "phone" },
            { label: "屋齡", value: "houseAge" },
            { label: "地區", value: "location" },
            { label: "預算", value: "budget" },
          ],
        },
        label: { type: "text", label: "顯示文字" },
      },
      defaultItemProps: { name: "name", label: "姓名｜Name" },
    };
    addTextField("contactMessageLabel", "詢問欄標題");
    pageFields.contactTypeOptions = {
      type: "array",
      label: "詢問類型選項",
      getItemSummary: (item: { text?: string }) => item.text || "新選項",
      arrayFields: { text: { type: "text", label: "選項文字" } },
      defaultItemProps: { text: "新選項" },
    };
  } else {
    addTextField("eyebrow", "英文小標");
    addTextField("title", "主標題");
    addTextField("subtitle", "副標題／英文標題");
    addTextField("description", "頁面說明", "textarea");
  }

  if (path === "/new" || path === "/new/blog") {
    pageFields.stories = {
      type: "array",
      label: "News／文章（拖曳即可排序）",
      getItemSummary: (item: { title?: string }) => item.title || "新文章",
      arrayFields: {
        title: { type: "text", label: "文章標題" },
        image: { ...imageField, label: "文章封面" },
        imageAlt: { type: "text", label: "封面替代文字" },
        date: { type: "text", label: "日期" },
        category: {
          type: "select",
          label: "分類",
          options: [
            { label: "國際獎項", value: "AWARD" },
            { label: "媒體報導", value: "PRESS" },
          ],
        },
        href: { type: "text", label: "文章連結" },
      },
      defaultItemProps: {
        title: "新文章",
        image: "",
        imageAlt: "",
        date: "",
        category: "PRESS",
        href: "",
      },
    };
  }

  if (path === "/new/projects/new") {
    pageFields.projectSections = {
      type: "array",
      label: "作品分區標題",
      getItemSummary: (item: { title?: string }) => item.title || "未命名分區",
      arrayFields: {
        slug: {
          type: "select",
          label: "分區",
          options: [
            { label: "住宅空間", value: "residential" },
            { label: "商業空間", value: "commercial" },
            { label: "全部作品", value: "all" },
          ],
        },
        title: { type: "text", label: "中文標題" },
        english: { type: "text", label: "英文標題" },
        moreLabel: { type: "text", label: "連結文字" },
        badge: { type: "text", label: "右側標記" },
      },
      defaultItemProps: {
        slug: "all",
        title: "全部作品",
        english: "All Projects",
        moreLabel: "MORE",
        badge: "New",
      },
    };
  }

  if (category) {
    pageFields.projectCards = {
      type: "array",
      label: "作品格（拖曳即可排序）",
      getItemSummary: (item: { title?: string; projectSlug?: string }) =>
        item.title || item.projectSlug || "未選擇作品",
      arrayFields: {
        projectSlug: {
          type: "select",
          label: "連結的作品",
          options: pageProjects.map((project) => ({
            label: `${project.number}｜${project.title}`,
            value: project.slug,
          })),
        },
        title: { type: "text", label: "卡片標題" },
        english: { type: "text", label: "英文標題" },
        description: { type: "textarea", label: "卡片說明" },
        cover: { ...imageField, label: "卡片封面" },
      },
      defaultItemProps: {
        projectSlug: pageProjects[0]?.slug ?? "",
        title: pageProjects[0]?.title ?? "新作品",
        english: pageProjects[0]?.english ?? "",
        description: pageProjects[0]?.paragraphs[0] ?? "",
        cover:
          pageProjects[0]?.cover ||
          pageProjects[0]?.gallery[0] ||
          pageProjects[0]?.landscape ||
          "",
      },
    };
  }

  pageFields.sections = {
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
  };

  const SianyingPageConfig = {
    label: "翔胤新版頁面內容",
    fields: pageFields,
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
