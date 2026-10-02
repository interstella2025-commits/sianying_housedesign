import type { GalleryProject } from "@/app/lib/project-gallery";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

export function applyProjectCards<T extends GalleryProject>(
  projects: T[],
  settings: SianyingPageSettings | null,
): T[] {
  if (!settings?.projectCards?.length) return projects;

  return settings.projectCards.flatMap((card) => {
    const project = projects.find((item) => item.slug === card.projectSlug);
    if (!project) return [];
    return [{
      ...project,
      title: card.title || project.title,
      english: card.english || project.english,
      cover: card.cover || project.cover,
      paragraphs: card.description
        ? [card.description, ...project.paragraphs.slice(1)]
        : project.paragraphs,
    } as T];
  });
}
