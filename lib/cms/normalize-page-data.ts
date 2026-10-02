import type { Data } from "@puckeditor/core";
import { getProjectsForCategory, type ProjectCategorySlug } from "@/app/lib/new-site-projects";
import type { Project } from "@/lib/project-types";
import { createPageSeed } from "@/lib/puck/page-seeds";
import { isEditablePagePath } from "@/lib/puck/editable-pages";

const categoryByPath: Partial<Record<string, ProjectCategorySlug>> = {
  "/new": "all",
  "/new/projects/new": "all",
  "/new/projects/all": "all",
  "/new/projects/residential": "residential",
  "/new/projects/commercial": "commercial",
};

export function normalizePageData(
  data: Data,
  options?: { path?: string; projects?: Project[] },
): Data {
  const category = options?.path ? categoryByPath[options.path] : undefined;
  const defaultBlock = options?.path && isEditablePagePath(options.path)
    ? createPageSeed(options.path).content.find((item) => item.type === "SianyingPage")
    : undefined;

  return {
    ...data,
    content: data.content.map((item) => {
      if (item.type !== "SianyingPage") return item;
      const props = {
        ...((defaultBlock?.props ?? {}) as Record<string, unknown>),
        ...(item.props as Record<string, unknown>),
      };
      if (!category || !options?.projects?.length) return { ...item, props };
      if (Array.isArray(props.projectCards) && props.projectCards.length > 0) {
        return { ...item, props };
      }

      const projectCards = getProjectsForCategory(category, options.projects).map((project) => ({
        projectSlug: project.slug,
        title: project.title,
        english: project.english,
        description: project.paragraphs[0] ?? "",
        cover: project.cover || project.gallery[0] || project.landscape,
      }));

      return { ...item, props: { ...props, projectCards } };
    }),
  };
}
