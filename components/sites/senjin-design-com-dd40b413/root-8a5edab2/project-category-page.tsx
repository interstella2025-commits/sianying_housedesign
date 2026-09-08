import Image from "next/image";
import Link from "next/link";

import type { GalleryProject } from "@/app/lib/project-gallery";
import {
  getNewProjectSections,
  getProjectsForCategory,
  projectCategories,
  type ProjectCategorySlug,
} from "@/app/lib/new-site-projects";
import { assetRoot } from "@/data/siangyin";
import { getStoredProjects } from "@/lib/cms/projects-store";
import { getPageSettings } from "@/lib/cms/pages";
import { PageSupplements } from "@/components/cms/page-supplements";

import { InnerPageShell } from "./inner-page-shell";

function ProjectIndexCard({
  project,
  priority = false,
}: {
  project: GalleryProject;
  priority?: boolean;
}) {
  const cover =
    project.cover ?? `${assetRoot}/projects/project-${project.number}.webp`;

  return (
    <article className="new-project-index-card">
      <Link
        href={`/new/projects/${project.slug}`}
        className="new-project-index-media"
        aria-label={`查看${project.title}完整作品`}
      >
        <Image
          src={cover}
          alt={`${project.title}室內設計完工作品`}
          fill
          priority={priority}
          sizes="(max-width: 760px) 100vw, 50vw"
        />
        {project.panorama ? <span>360° PANORAMA</span> : null}
      </Link>
      <Link href={`/new/projects/${project.slug}`} className="new-project-index-caption">
        <div>
          <h2>{project.title}</h2>
          <span>PROJECT {project.number}</span>
        </div>
        <p>{project.english}</p>
        <small>{project.paragraphs[0]}</small>
      </Link>
    </article>
  );
}

export async function ProjectCategoryPage({ category }: { category: ProjectCategorySlug }) {
  const config = projectCategories[category];
  const sourceProjects = await getStoredProjects();
  const projects = getProjectsForCategory(category, sourceProjects);
  const settings = await getPageSettings(`/new/projects/${category}`);

  return (
    <InnerPageShell tone="light">
      <div className="new-project-index-page">
        <header className="new-project-index-intro">
          <h1>{settings?.title || config.title}</h1>
          <h2>{settings?.subtitle || config.subtitle}</h2>
          <span>{settings?.eyebrow || config.english}</span>
          <p>{settings?.description || config.description}</p>
        </header>

        <section className="new-project-index-grid" aria-label={config.subtitle}>
          {projects.map((project, index) => (
            <ProjectIndexCard key={project.slug} project={project} priority={index < 2} />
          ))}
        </section>
        <PageSupplements settings={settings} />
      </div>
    </InnerPageShell>
  );
}

export async function NewProjectsOverview() {
  const sourceProjects = await getStoredProjects();
  const sections = getNewProjectSections(sourceProjects);
  const settings = await getPageSettings("/new/projects/new");
  return (
    <InnerPageShell tone="light">
      <div className="new-project-overview-page">
        <header className="new-project-index-intro">
          <h1>{settings?.title || "最新設計"}</h1>
          <h2>{settings?.subtitle || "New Designs"}</h2>
          <span>{settings?.eyebrow || "NEW DESIGNS"}</span>
          <p>{settings?.description || "翔胤最新住宅、商業空間與 3D 全景作品。"}</p>
        </header>
        {sections.map((section) => (
          <section key={section.slug} className="new-project-overview-section">
            <header>
              <div>
                <h2>{section.subtitle}</h2>
                <p>{section.english}</p>
              </div>
              <Link href={`/new/projects/${section.slug}`}>MORE</Link>
              <span>New</span>
            </header>
            <div className="new-project-index-grid">
              {section.projects.map((project, index) => (
                <ProjectIndexCard
                  key={project.slug}
                  project={project}
                  priority={section.slug === "residential" && index < 2}
                />
              ))}
            </div>
          </section>
        ))}
        <PageSupplements settings={settings} />
      </div>
    </InnerPageShell>
  );
}
