import { galleryProjects, type GalleryProject } from "./project-gallery";

export type ProjectCategorySlug =
  | "all"
  | "residential"
  | "commercial"
  | "panorama";

export type ProjectCategory = {
  slug: ProjectCategorySlug;
  title: string;
  subtitle: string;
  english: string;
  description: string;
};

export const projectCategories: Record<ProjectCategorySlug, ProjectCategory> = {
  all: {
    slug: "all",
    title: "作品",
    subtitle: "全部作品",
    english: "All Projects",
    description: "從住宅、商業空間到建築更新，完整收錄翔胤的設計實踐。",
  },
  residential: {
    slug: "residential",
    title: "住宅",
    subtitle: "住宅空間",
    english: "Residential",
    description: "以光、材質與生活動線，形塑貼近日常的住宅空間。",
  },
  commercial: {
    slug: "commercial",
    title: "商空",
    subtitle: "商業與特殊空間",
    english: "Commercial",
    description: "從使用情境與品牌需求出發，建立清楚而耐用的空間秩序。",
  },
  panorama: {
    slug: "panorama",
    title: "環景",
    subtitle: "3D 全景作品",
    english: "Panorama",
    description: "以 360 度全景保留空間尺度、動線與視線關係。",
  },
};

const commercialProjectNumbers = new Set(["06", "11"]);

export function getProjectsForCategory(
  slug: ProjectCategorySlug,
): GalleryProject[] {
  if (slug === "all") return galleryProjects;
  if (slug === "panorama") {
    return galleryProjects.filter((project) => Boolean(project.panorama));
  }
  if (slug === "commercial") {
    return galleryProjects.filter((project) =>
      commercialProjectNumbers.has(project.number),
    );
  }

  return galleryProjects.filter(
    (project) => !commercialProjectNumbers.has(project.number),
  );
}

export function getProjectCategory(project: GalleryProject): ProjectCategory {
  return commercialProjectNumbers.has(project.number)
    ? projectCategories.commercial
    : projectCategories.residential;
}

export const newProjectSections = [
  {
    ...projectCategories.residential,
    projects: getProjectsForCategory("residential").slice(0, 2),
  },
  {
    ...projectCategories.commercial,
    projects: getProjectsForCategory("commercial").slice(0, 2),
  },
  {
    ...projectCategories.panorama,
    projects: getProjectsForCategory("panorama").slice(0, 2),
  },
  {
    ...projectCategories.all,
    projects: galleryProjects.slice(-2),
  },
] as const;
