import "server-only";

import type { Data } from "@puckeditor/core";
import { readCmsJson, writeCmsJson } from "@/lib/cms/storage.server";
import { EDITABLE_PAGE_PATHS, type EditablePagePath } from "@/lib/puck/editable-pages";
import { createPageSeed, getAllPageSeeds } from "@/lib/puck/page-seeds";
import { extractPageSettings } from "@/lib/puck/page-settings";

type PageMap = Record<string, Data>;
const PAGES_KEY = "pages";

export async function getAllPages(): Promise<PageMap> {
  const stored = await readCmsJson<PageMap>(PAGES_KEY);
  const pages = { ...getAllPageSeeds(), ...(stored ?? {}) };

  // The redesigned homepage used "/" as its storage key before the public
  // route and editor were explicitly namespaced under /new. Preserve any
  // content that was already published through the earlier editor.
  if (!stored?.["/new"] && stored?.["/"]) {
    pages["/new"] = stored["/"];
  }

  return pages;
}

export async function getPageData(path: string): Promise<Data | null> {
  const pages = await getAllPages();
  return pages[path] ?? null;
}

export async function getPageSettings(path: string) {
  return extractPageSettings(await getPageData(path));
}

export async function savePageData(path: string, data: Data): Promise<void> {
  if (!(EDITABLE_PAGE_PATHS as readonly string[]).includes(path)) {
    throw new Error("此頁面不在可編輯清單中");
  }
  const stored = (await readCmsJson<PageMap>(PAGES_KEY)) ?? {};
  stored[path] = data;
  await writeCmsJson(PAGES_KEY, stored);
}

export function getDefaultPageData(path: string): Data | null {
  return (EDITABLE_PAGE_PATHS as readonly string[]).includes(path)
    ? createPageSeed(path as EditablePagePath)
    : null;
}
