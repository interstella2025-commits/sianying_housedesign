"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import galleryAssets from "../project-gallery-assets.json";
import { projects, type Project } from "../data";
import { SiteMusicPlayer } from "./SiteMusicProvider";

type PresentationProject = Project & {
  slug: string;
  gallery: string[];
};

const presentationProjects: PresentationProject[] = galleryAssets.map((asset, index) => ({
  ...projects[index],
  slug: asset.slug,
  gallery: asset.images,
}));

export function ProjectPresentation() {
  const [selected, setSelected] = useState<PresentationProject | null>(null);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const featured = useMemo(() => presentationProjects.slice(0, 4), []);
  const archive = useMemo(() => presentationProjects.slice(4), []);

  const closeGallery = useCallback(() => {
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setSelected(null);
      setClosing(false);
    }, 280);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [closeGallery, selected]);

  return (
    <>
      <section className="featured-projects" id="works">
        <div className="featured-projects-heading content-shell" data-reveal>
          <p className="section-kicker">精選完工作品</p>
          <h2>住宅設計案例</h2>
          <p>以下收錄不同格局與需求的完工作品。</p>
        </div>

        <div className="featured-stack" data-project-stack>
          {featured.map((project, index) => (
            <article className="featured-stack-card" key={project.slug} data-stack-card>
              <div className="featured-stack-inner content-shell">
                <div className="featured-stack-media" data-parallax>
                  <Image
                    src={project.gallery[0]}
                    alt={`${project.title}完工作品`}
                    fill
                    unoptimized
                    sizes="(max-width: 899px) 100vw, 70vw"
                  />
                  <div className="project-cutout-control">
                    <button type="button" onClick={() => setSelected(project)}>
                      觀看作品
                      <ArrowUpRight aria-hidden="true" weight="bold" />
                    </button>
                  </div>
                </div>
                <div className="featured-stack-copy">
                  {index === 0 && <SiteMusicPlayer />}
                  {index !== 0 && <p>{project.english}</p>}
                  <h3>{project.title}</h3>
                  {index === 0 && project.english && <p>{project.english}</p>}
                  <p>{project.paragraphs.join(" ")}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="project-archive content-shell">
        <div className="project-archive-heading" data-reveal>
          <h2>更多完工作品</h2>
        </div>
        <div className="project-archive-grid">
          {archive.map((project, index) => (
            <button
              type="button"
              className={`archive-project archive-project-${(index % 4) + 1}`}
              key={project.slug}
              onClick={() => setSelected(project)}
              data-reveal
            >
              <span className="archive-project-media">
                <Image
                  src={project.gallery[0]}
                  alt={`${project.title}完工作品`}
                  fill
                  unoptimized
                  sizes="(max-width: 899px) 100vw, 58vw"
                />
              </span>
              <span className="archive-project-meta">
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.english}</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="project-gallery-backdrop"
          data-closing={closing}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeGallery();
          }}
        >
          <div
            className="project-gallery-panel"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-gallery-title"
          >
            <header className="project-gallery-header">
              <div>
                <span>{selected.english}</span>
                <h2 id="project-gallery-title">{selected.title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeGallery} aria-label="關閉作品相簿">
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="project-gallery-hero">
              <Image
                src={selected.gallery[0]}
                alt={`${selected.title}完工作品主要空間`}
                fill
                priority
                unoptimized
                sizes="100vw"
              />
              <a className="gallery-down" href="#gallery-story">
                閱讀設計概念
                <ArrowDown aria-hidden="true" />
              </a>
            </div>

            <div className="project-gallery-story" id="gallery-story">
              <p>{selected.english}</p>
              <div>
                <h3>{selected.title}</h3>
                {selected.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="project-gallery-images">
              {selected.gallery.slice(1).map((image, index) => (
                <figure key={image} className={index === 0 || index === 3 ? "gallery-wide" : ""}>
                  <Image
                    src={image}
                    alt={`${selected.title}完工作品空間 ${index + 2}`}
                    fill
                    unoptimized
                    sizes="(max-width: 899px) 100vw, 50vw"
                  />
                </figure>
              ))}
            </div>

            <div className="project-gallery-cta">
              <p>喜歡這個作品的空間語言？</p>
              <a className="primary-button" href="#contact" onClick={() => setSelected(null)}>
                預約丈量
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
