import {
  getNewProjectSections,
  getProjectsForCategory,
  type ProjectCategorySlug,
} from "@/app/lib/new-site-projects";
import { getStoredProjects } from "@/lib/cms/projects-store";
import { getPageSettings } from "@/lib/cms/pages";

import { InnerPageShell } from "./inner-page-shell";
import {
  NewProjectsOverviewContent,
  ProjectCategoryContent,
} from "./project-category-content";

export async function ProjectCategoryPage({ category }: { category: ProjectCategorySlug }) {
  const sourceProjects = await getStoredProjects();
  const projects = getProjectsForCategory(category, sourceProjects);
  const settings = await getPageSettings(`/new/projects/${category}`);

  return (
    <InnerPageShell tone="light">
      <ProjectCategoryContent category={category} projects={projects} settings={settings} />
    </InnerPageShell>
  );
}

export async function NewProjectsOverview() {
  const sourceProjects = await getStoredProjects();
  const sections = getNewProjectSections(sourceProjects);
  const settings = await getPageSettings("/new/projects/new");
  return (
    <InnerPageShell tone="light">
      <NewProjectsOverviewContent sections={sections} settings={settings} />
    </InnerPageShell>
  );
}
