import Link from "next/link";

import type { Project } from "@/lib/project-types";

import { PortfolioProjectMedia } from "./portfolio-project-media";
import { Reveal } from "./reveal";

export function SelectedWorks({ projects }: { projects: Project[] }) {
  return (
    <section id="works" className="section-anchor pb-28" aria-labelledby="works-heading">
      <div className="portfolio-column">
        <Reveal>
          <h2 id="works-heading" className="portfolio-section-title">
            <Link href="/new/projects/new">New Projects</Link>
          </h2>
        </Reveal>

        <div className="works-list">
          {projects.map((project) => {
            const detailHref = `/new/projects/${project.slug}`;

            return (
              <Reveal key={project.number}>
                <figure className="portfolio-project-card group m-0 min-w-0">
                  <div className="relative aspect-square overflow-hidden bg-[#151515]">
                    <PortfolioProjectMedia
                      title={project.title}
                      description={project.paragraphs[0] ?? ""}
                      image={project.cover}
                      panorama={project.panorama}
                    />
                    <Link
                      href={detailHref}
                      className={`project-card-media-link${
                        project.panorama ? " is-panorama" : ""
                      }`}
                      aria-label={`查看${project.title}完整作品與更多照片`}
                    >
                      <span>VIEW PROJECT ↗</span>
                    </Link>
                  </div>

                  <Link
                    href={detailHref}
                    className="project-card-caption-link"
                    aria-label={`進入${project.title}作品分頁`}
                  >
                    <figcaption className="pt-2.5 text-[var(--paper)]">
                      <div className="flex items-center justify-between gap-6 text-[0.68rem] tracking-[0.08em]">
                        <h3 className="m-0 font-light tracking-[0.08em]">
                          {project.title}
                        </h3>
                        <span className="shrink-0 font-[family-name:var(--font-montserrat)] text-[0.55rem] tracking-[0.16em] text-[var(--paper-soft)]">
                          PROJECT {project.number}
                        </span>
                      </div>
                      <p className="mt-1 font-[family-name:var(--font-montserrat)] text-[0.56rem] tracking-[0.13em] text-[var(--paper-soft)] uppercase">
                        {project.english}
                      </p>
                      <p className="mt-2 max-w-[34rem] text-[0.66rem] leading-[1.8] tracking-[0.04em] text-[var(--paper-soft)]">
                        {project.paragraphs[0]}
                      </p>
                    </figcaption>
                  </Link>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
