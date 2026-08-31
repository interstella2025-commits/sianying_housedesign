import Image from "next/image";
import Link from "next/link";

import { ProjectCoverMedia } from "@/app/components/ProjectCoverMedia";
import { ProjectGalleryGrid } from "@/app/components/ProjectGalleryGrid";
import {
  getGalleryThumbnails,
  type GalleryProject,
} from "@/app/lib/project-gallery";
import { assetRoot } from "@/data/siangyin";

type ProjectDetailPageProps = {
  project: GalleryProject;
  previousProject?: GalleryProject;
  nextProject?: GalleryProject;
};

function ProjectPagerLink({
  direction,
  project,
}: {
  direction: "PREVIOUS" | "NEXT";
  project: GalleryProject;
}) {
  return (
    <Link
      href={`/new/projects/${project.slug}`}
      className={`project-detail-pager-link project-detail-pager-link--${direction.toLowerCase()}`}
    >
      <span className="project-detail-pager-direction">
        {direction === "PREVIOUS" ? "← PREVIOUS PROJECT" : "NEXT PROJECT →"}
      </span>
      <strong>{project.title}</strong>
      <small>{project.english}</small>
    </Link>
  );
}

export function ProjectDetailPage({
  project,
  previousProject,
  nextProject,
}: ProjectDetailPageProps) {
  const galleryImages = getGalleryThumbnails(project);

  return (
    <div className="project-detail-page">
      <a href="#project-main" className="skip-link">
        跳至作品內容
      </a>

      <header className="project-detail-header">
        <Link href="/new" className="project-detail-brand" aria-label="返回翔胤室內設計新版首頁">
          <span className="project-detail-brand-mark">
            <Image
              src={`${assetRoot}/brand/logo.png`}
              alt=""
              fill
              sizes="42px"
              className="object-contain"
            />
          </span>
          <span>
            翔胤室內設計
            <small>SIANG YIN INTERIOR DESIGN</small>
          </span>
        </Link>

        <Link href="/new#works" className="project-detail-back-link">
          ← 返回作品集
        </Link>
      </header>

      <main id="project-main" className="project-detail-main" tabIndex={-1}>
        <section className="project-detail-hero" aria-labelledby="project-title">
          <div className="project-detail-copy">
            <p className="project-detail-number">PROJECT {project.number}</p>
            <h1 id="project-title">{project.title}</h1>
            <p className="project-detail-english">{project.english}</p>

            <div className="project-detail-description">
              {project.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="project-detail-media-meta" aria-label="作品媒體資訊">
              <span>{project.gallery.length} PHOTOS</span>
              {project.panorama ? <span>360° PANORAMA</span> : null}
            </div>
          </div>

          <div className="project-detail-media">
            <ProjectCoverMedia
              project={project}
              priority
              sizes="(max-width: 899px) 100vw, 72vw"
              autoRotate={0.02}
              className="project-detail-panorama"
              showHint
            />
          </div>
        </section>

        <section className="project-detail-gallery" aria-label={`${project.title}完整作品照片`}>
          <ProjectGalleryGrid
            title={project.title}
            images={galleryImages}
            batchSize={24}
          />
        </section>

        <nav className="project-detail-pagination" aria-label="其他作品">
          {previousProject ? (
            <ProjectPagerLink direction="PREVIOUS" project={previousProject} />
          ) : (
            <span aria-hidden="true" />
          )}
          {nextProject ? (
            <ProjectPagerLink direction="NEXT" project={nextProject} />
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>

        <div className="project-detail-footer-actions">
          <Link href="/new#works">瀏覽全部作品</Link>
          <Link href="/new#contact">聯絡翔胤設計</Link>
        </div>
      </main>
    </div>
  );
}
