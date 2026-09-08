import "server-only";

import { readCmsJson, writeCmsJson } from "@/lib/cms/storage.server";
import { mergeMediaItems } from "@/lib/cms/media-seed.server";

export type MediaSource = "upload" | "site" | "youtube";

export type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: "image" | "video" | "youtube" | "other";
  size: number;
  createdAt: string;
  poster?: string;
  source?: MediaSource;
};

const MEDIA_KEY = "media";
const YOUTUBE_ORDER_KEY = "media-youtube-order";

export async function listStoredMedia(): Promise<MediaItem[]> {
  const items = await readCmsJson<MediaItem[]>(MEDIA_KEY);
  return items ?? [];
}

export async function getYouTubeOrder(): Promise<string[]> {
  return (await readCmsJson<string[]>(YOUTUBE_ORDER_KEY)) ?? [];
}

export async function saveYouTubeOrder(ids: string[]): Promise<void> {
  await writeCmsJson(YOUTUBE_ORDER_KEY, ids);
}

function applyYouTubeOrder(items: MediaItem[], order: string[]): MediaItem[] {
  if (!order.length) return items;

  const rank = new Map(order.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    if (a.type === "youtube" && b.type === "youtube") {
      const aRank = rank.get(a.id) ?? rank.get(a.url) ?? Number.MAX_SAFE_INTEGER;
      const bRank = rank.get(b.id) ?? rank.get(b.url) ?? Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
    }

    if (a.createdAt === b.createdAt) return a.name.localeCompare(b.name, "zh-Hant");
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function listMedia(): Promise<MediaItem[]> {
  const [merged, order] = await Promise.all([
    mergeMediaItems(await listStoredMedia()),
    getYouTubeOrder(),
  ]);
  return applyYouTubeOrder(merged, order);
}

export async function addMedia(item: MediaItem): Promise<MediaItem[]> {
  const items = await listStoredMedia();
  const next = [item, ...items.filter((entry) => entry.url !== item.url)];
  await writeCmsJson(MEDIA_KEY, next);
  return listMedia();
}

export async function upsertMedia(item: MediaItem): Promise<MediaItem[]> {
  const items = await listStoredMedia();
  const index = items.findIndex((entry) => entry.id === item.id || entry.url === item.url);
  const next =
    index >= 0
      ? items.map((entry, entryIndex) => (entryIndex === index ? item : entry))
      : [...items, item];
  await writeCmsJson(MEDIA_KEY, next);
  return listMedia();
}

export async function removeMedia(id: string): Promise<MediaItem[]> {
  const items = await listStoredMedia();
  const next = items.filter((item) => item.id !== id);
  await writeCmsJson(MEDIA_KEY, next);
  return listMedia();
}

export function detectMediaType(mime: string): MediaItem["type"] {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "other";
}
