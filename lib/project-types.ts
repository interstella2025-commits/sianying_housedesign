export type ProjectCategoryValue = "residential" | "commercial";

export type Project = {
  slug: string;
  number: string;
  title: string;
  english: string;
  paragraphs: string[];
  landscape: string;
  portrait: string;
  cover: string;
  gallery: string[];
  panorama?: string;
  category: ProjectCategoryValue;
  published: boolean;
};

export const PROJECT_CATEGORIES: Array<{ value: ProjectCategoryValue; label: string }> = [
  { value: "residential", label: "住宅空間" },
  { value: "commercial", label: "商業／特殊空間" },
];
