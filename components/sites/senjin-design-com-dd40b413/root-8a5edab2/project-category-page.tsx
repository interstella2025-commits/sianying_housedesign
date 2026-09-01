import Image from "next/image";
import Link from "next/link";

import type { GalleryProject } from "@/app/lib/project-gallery";
import {
  getProjectsForCategory,
  newProjectSections,
  projectCategories,
  type ProjectCategorySlug,
} from "@/app/lib/new-site-projects";
import { assetRoot } from "@/data/siangyin";

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

export function ProjectCategoryPage({ category }: { category: ProjectCategorySlug }) {
  const config = projectCategories[category];
  const projects = getProjectsForCategory(category);

  return (
    <InnerPageShell tone="light">
      <div className="new-project-index-page">
        <header className="new-project-index-intro">
          <h1>{config.title}</h1>
          <h2>{config.subtitle}</h2>
          <span>{config.english}</span>
          <p>{config.description}</p>
        </header>

        <section className="new-project-index-grid" aria-label={config.subtitle}>
          {projects.map((project, index) => (
            <ProjectIndexCard key={project.slug} project={project} priority={index < 2} />
          ))}
        </section>
      </div>
    </InnerPageShell>
  );
}

export function NewProjectsOverview() {
  return (
    <InnerPageShell tone="light">
      <div className="new-project-overview-page">
        <h1 className="sr-only">最新設計</h1>
        {newProjectSections.map((section) => (
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
      </div>
    </InnerPageShell>
  );
}
