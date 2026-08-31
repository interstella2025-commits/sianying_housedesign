import Link from "next/link";

import { ProjectCoverMedia } from "@/app/components/ProjectCoverMedia";
import { ProjectGalleryGrid } from "@/app/components/ProjectGalleryGrid";
import {
  getGalleryThumbnails,
  type GalleryProject,
} from "@/app/lib/project-gallery";
import { getProjectCategory } from "@/app/lib/new-site-projects";
import { company } from "@/data/siangyin";

import { InnerPageShell } from "./inner-page-shell";

type ProjectDetailPageProps = {
  project: GalleryProject;
  previousProject?: GalleryProject;
  nextProject?: GalleryProject;
};

function RoundProjectLink({
  project,
  direction,
}: {
  project?: GalleryProject;
  direction: "previous" | "next";
}) {
  if (!project) return <span aria-hidden="true" />;

  return (
    <Link
      href={`/new/projects/${project.slug}`}
      className={`project-editorial-arrow is-${direction}`}
      aria-label={`${direction === "previous" ? "上一件" : "下一件"}作品：${project.title}`}
    >
      {direction === "previous" ? "←" : "→"}
    </Link>
  );
}

export function ProjectDetailPage({
  project,
  previousProject,
  nextProject,
}: ProjectDetailPageProps) {
  const galleryImages = getGalleryThumbnails(project);
  const category = getProjectCategory(project);

  return (
    <InnerPageShell tone="light">
      <article className="project-detail-page">
        <section className="project-editorial-intro" aria-labelledby="project-title">
          <div className="project-editorial-title">
            <p>{project.title}</p>
            <h1 id="project-title">{project.english}</h1>
            <span>PROJECT {project.number}</span>
          </div>
          <p>{project.paragraphs[0]}</p>
          <p>{project.paragraphs[1]}</p>

          <nav className="project-editorial-arrows" aria-label="前後作品">
            <RoundProjectLink project={previousProject} direction="previous" />
            <RoundProjectLink project={nextProject} direction="next" />
          </nav>
        </section>

        {project.panorama ? (
          <section className="project-editorial-panorama" aria-label={`${project.title} 3D 全景`}>
            <ProjectCoverMedia
              project={project}
              priority
              sizes="100vw"
              autoRotate={0.02}
              className="project-detail-panorama"
              showHint
            />
          </section>
        ) : null}

        <section className="project-detail-gallery" aria-label={`${project.title}完整作品照片`}>
          <ProjectGalleryGrid
            title={project.title}
            images={galleryImages}
            batchSize={galleryImages.length}
          />
        </section>

        <section className="project-editorial-information">
          <div>
            <p>INFORMATION</p>
            <span>作品資訊</span>
          </div>
          <dl>
            <div><dt>項目名稱：</dt><dd>{project.title}</dd></div>
            <div><dt>英文名稱：</dt><dd>{project.english}</dd></div>
            <div><dt>作品類型：</dt><dd>{category.subtitle}</dd></div>
            <div><dt>影像數量：</dt><dd>{project.gallery.length} 張</dd></div>
            <div><dt>3D 全景：</dt><dd>{project.panorama ? "提供 360° 拖曳環視" : "—"}</dd></div>
            <div><dt>設計團隊：</dt><dd>{company.name}</dd></div>
          </dl>
          <Link href={`/new/projects/${category.slug}`} className="project-back-index">
            ↑ Back To Index
          </Link>
        </section>

        <nav className="project-detail-pagination" aria-label="其他作品">
          {previousProject ? (
            <Link href={`/new/projects/${previousProject.slug}`}>
              <span>← PREVIOUS WORK</span>
              <strong>{previousProject.title}</strong>
              <small>{previousProject.english}</small>
            </Link>
          ) : <span aria-hidden="true" />}
          {nextProject ? (
            <Link href={`/new/projects/${nextProject.slug}`}>
              <span>NEXT WORK →</span>
              <strong>{nextProject.title}</strong>
              <small>{nextProject.english}</small>
            </Link>
          ) : <span aria-hidden="true" />}
        </nav>
      </article>
    </InnerPageShell>
  );
}
