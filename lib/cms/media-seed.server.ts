import "server-only";

import fs from "fs/promises";
import path from "path";
import { galleryProjects } from "@/app/lib/project-gallery";
import type { MediaItem } from "@/lib/cms/media";

const MEDIA_EXTENSIONS = new Map([
  [".jpg", "image"],
  [".jpeg", "image"],
  [".png", "image"],
  [".webp", "image"],
  [".gif", "image"],
  [".avif", "image"],
  [".mp4", "video"],
  [".webm", "video"],
  [".mov", "video"],
]);

async function scanDirectory(relativeDirectory: string): Promise<MediaItem[]> {
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  try {
    const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .flatMap((entry) => {
        const type = MEDIA_EXTENSIONS.get(path.extname(entry.name).toLowerCase());
        if (!type) return [];
        const url = `/${path.join(relativeDirectory, entry.name).replace(/\\/g, "/")}`;
        return [{
          id: `site-${relativeDirectory}-${entry.name}`,
          url,
          name: entry.name,
          type: type as "image" | "video",
          size: 0,
          createdAt: "1970-01-01T00:00:00.000Z",
          source: "site" as const,
        }];
      });
  } catch {
    return [];
  }
}

function projectMedia(): MediaItem[] {
  const urls = new Set<string>();
  for (const project of galleryProjects) {
    for (const url of [project.cover, project.panorama, ...project.gallery]) {
      if (url) urls.add(url);
    }
  }
  return Array.from(urls).map((url) => ({
    id: `project-${url}`,
    url,
    name: url.split("/").at(-1) ?? "作品照片",
    type: "image" as const,
    size: 0,
    createdAt: "1970-01-01T00:00:01.000Z",
    source: "site" as const,
  }));
}

export async function buildMediaSeed(): Promise<MediaItem[]> {
  const uploaded = await scanDirectory("sianying/uploads");
  return [...projectMedia(), ...uploaded];
}

export async function mergeMediaItems(stored: MediaItem[]): Promise<MediaItem[]> {
  const map = new Map<string, MediaItem>();
  for (const item of await buildMediaSeed()) map.set(item.url, item);
  for (const item of stored) map.set(item.url, item);
  return Array.from(map.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name, "zh-Hant"),
  );
}
