"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import galleryAssets from "../project-gallery-assets.json";
import { projects, type Project } from "../data";

type WorkProject = Project & {
  slug: string;
  gallery: string[];
};

const workProjects: WorkProject[] = galleryAssets.map((asset, index) => ({
  ...projects[index],
  slug: asset.slug,
  gallery: asset.images,
}));

export function WorksArchive() {
  const [selected, setSelected] = useState<WorkProject | null>(null);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

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
      <section className="works-hero">
        <div className="works-hero-copy">
          <p className="section-kicker" data-hero-kicker>完工作品集</p>
          <h1>
            <span className="line-mask"><span data-hero-word>住宅設計</span></span>
            <span className="line-mask"><span data-hero-word>完工作品</span></span>
          </h1>
          <p data-hero-summary>
            本頁收錄 12 個住宅案例，內容包含格局、收納、採光、材質與完工細節。
          </p>
        </div>

        <div className="works-hero-collage" data-hero-media>
          <div className="works-hero-primary" data-parallax>
            <Image
              src={workProjects[0].gallery[0]}
              alt={`${workProjects[0].title}完工作品`}
              fill
              priority
              unoptimized
              sizes="(max-width: 899px) 100vw, 62vw"
            />
          </div>
          <div className="works-hero-secondary" data-parallax>
            <Image
              src={workProjects[3].gallery[1]}
              alt={`${workProjects[3].title}完工作品細節`}
              fill
              unoptimized
              sizes="(max-width: 899px) 42vw, 20vw"
            />
          </div>
        </div>
      </section>

      <section className="works-manifesto content-shell">
        <div className="works-facts" data-reveal>
          <div><strong>12</strong><span>完整案例</span></div>
          <div><strong>60</strong><span>空間影像</span></div>
          <div><strong>2010</strong><span>成立</span></div>
        </div>
      </section>

      <section className="works-catalog">
        <header className="works-catalog-heading content-shell" data-reveal>
          <h2>完整作品索引</h2>
          <p>點開作品，查看完整照片與設計說明。</p>
        </header>

        <div className="works-masonry content-shell">
          {workProjects.map((project, index) => (
            <button
              type="button"
              className={`works-index-card works-index-card-${(index % 6) + 1}`}
              key={project.slug}
              onClick={() => setSelected(project)}
              data-works-card
            >
              <span className="works-index-media">
                <Image
                  src={project.gallery[0]}
                  alt={`${project.title}完工作品`}
                  fill
                  unoptimized
                  sizes="(max-width: 899px) 100vw, 58vw"
                />
              </span>
              <span className="works-index-meta">
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.english}</small>
                </span>
                <span className="works-index-action">
                  {project.number}
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="works-closing content-shell" data-reveal>
        <h2>有裝修需求？<br />歡迎預約丈量或透過 LINE 諮詢。</h2>
        <Link className="primary-button" href="/#contact">
          預約丈量
          <ArrowRight aria-hidden="true" />
        </Link>
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
            aria-labelledby="works-gallery-title"
          >
            <header className="project-gallery-header">
              <div>
                <span>{selected.english}</span>
                <h2 id="works-gallery-title">{selected.title}</h2>
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
              <a className="gallery-down" href="#works-gallery-story">
                閱讀設計概念
                <ArrowDown aria-hidden="true" />
              </a>
            </div>

            <div className="project-gallery-story" id="works-gallery-story">
              <p>{selected.english}</p>
              <div>
                <h3>{selected.title}</h3>
                {selected.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
              <p>想進一步了解設計流程？</p>
              <Link className="primary-button" href="/#contact" onClick={() => setSelected(null)}>
                預約丈量
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
