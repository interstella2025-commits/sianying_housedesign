export const EDITABLE_PAGE_PATHS = [
  "/",
  "/new/about",
  "/new/blog",
  "/new/contact",
  "/new/projects/new",
  "/new/projects/all",
  "/new/projects/residential",
  "/new/projects/commercial",
] as const;

export type EditablePagePath = (typeof EDITABLE_PAGE_PATHS)[number];

export const EDITABLE_PAGE_LABELS: Record<EditablePagePath, string> = {
  "/": "首頁內容編輯",
  "/new/about": "關於翔胤編輯",
  "/new/blog": "消息與媒體編輯",
  "/new/contact": "聯絡頁編輯",
  "/new/projects/new": "最新設計頁編輯",
  "/new/projects/all": "全部作品頁編輯",
  "/new/projects/residential": "住宅作品頁編輯",
  "/new/projects/commercial": "商業空間頁編輯",
};

export function isEditablePagePath(path: string): path is EditablePagePath {
  return (EDITABLE_PAGE_PATHS as readonly string[]).includes(path);
}
