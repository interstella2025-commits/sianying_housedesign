"use client";

import {
  getNewProjectSections,
  getProjectsForCategory,
  type ProjectCategorySlug,
} from "@/app/lib/new-site-projects";
import { NewAboutContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-about-content";
import { NewBlogContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-blog-content";
import { NewContactContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-contact-content";
import { NewHomeContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-home-content";
import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import {
  NewProjectsOverviewContent,
  ProjectCategoryContent,
} from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-category-content";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";
import type { Project } from "@/lib/project-types";

type SianyingPagePreviewProps = {
  path: string;
  settings: SianyingPageSettings;
  projects: Project[];
};

const categoryByPath: Partial<Record<string, ProjectCategorySlug>> = {
  "/new/projects/all": "all",
  "/new/projects/residential": "residential",
  "/new/projects/commercial": "commercial",
};

export function SianyingPagePreview({
  path,
  settings,
  projects,
}: SianyingPagePreviewProps) {
  let content;

  if (path === "/new") {
    content = <NewHomeContent settings={settings} projects={projects} editorPreview />;
  } else if (path === "/new/about") {
    content = (
      <InnerPageShell tone="dark">
        <NewAboutContent settings={settings} />
      </InnerPageShell>
    );
  } else if (path === "/new/blog") {
    content = (
      <InnerPageShell tone="light">
        <NewBlogContent settings={settings} />
      </InnerPageShell>
    );
  } else if (path === "/new/contact") {
    content = (
      <InnerPageShell tone="dark" showFooter={false}>
        <NewContactContent settings={settings} />
      </InnerPageShell>
    );
  } else if (path === "/new/projects/new") {
    content = (
      <InnerPageShell tone="light">
        <NewProjectsOverviewContent
          sections={getNewProjectSections(projects)}
          settings={settings}
        />
      </InnerPageShell>
    );
  } else {
    const category = categoryByPath[path];
    content = category ? (
      <InnerPageShell tone="light">
        <ProjectCategoryContent
          category={category}
          projects={getProjectsForCategory(category, projects)}
          settings={settings}
        />
      </InnerPageShell>
    ) : null;
  }

  return (
    <div className="puck-page-preview senjin-clone" data-preview-path={path}>
      {content}
    </div>
  );
}
