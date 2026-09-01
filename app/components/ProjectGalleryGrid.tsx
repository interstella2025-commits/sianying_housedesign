"use client";

import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ProjectGalleryGridProps = {
  title: string;
  images: string[];
  batchSize?: number;
};

export function ProjectGalleryGrid({
  title,
  images,
  batchSize = 24,
}: ProjectGalleryGridProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleImages = useMemo(() => images.slice(0, visibleCount), [images, visibleCount]);
  const remaining = images.length - visibleImages.length;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrevious = useCallback(() => {
    setLightboxIndex((index) => {
      if (index === null) return index;
      return index === 0 ? images.length - 1 : index - 1;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((index) => {
      if (index === null) return index;
      return index === images.length - 1 ? 0 : index + 1;
    });
  }, [images.length]);

  const isLightboxOpen = lightboxIndex !== null;

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        lightboxRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        event.preventDefault();
      } else if (!lightboxRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [closeLightbox, isLightboxOpen, showNext, showPrevious]);

  if (!images.length) return null;

  return (
    <>
      <section className="project-gallery-images-block">
        <div className="project-gallery-images-heading">
          <p>更多照片</p>
          <span>{images.length} 張</span>
        </div>

        <div className="project-gallery-images">
          {visibleImages.map((image, index) => (
            <figure key={image}>
              <button
                type="button"
                className="project-gallery-thumb"
                aria-label={`放大查看 ${title} 照片 ${index + 2}`}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setLightboxIndex(index);
                }}
              >
                <Image
                  src={image}
                  alt={`${title}完工作品空間 ${index + 2}`}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes="(max-width: 899px) 50vw, 25vw"
                />
              </button>
            </figure>
          ))}
        </div>

        {remaining > 0 && (
          <button
            type="button"
            className="project-gallery-load-more"
            onClick={() => setVisibleCount((count) => count + batchSize)}
          >
            載入更多照片（還有 {remaining} 張）
          </button>
        )}
      </section>

      {lightboxIndex !== null && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={lightboxRef}
              className="project-image-lightbox"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeLightbox();
              }}
            >
              <div className="project-image-lightbox__panel" role="dialog" aria-modal="true" aria-label="放大照片">
                <button
                  ref={closeButtonRef}
                  autoFocus
                  type="button"
                  className="project-image-lightbox__close"
                  aria-label="關閉放大照片"
                  onClick={closeLightbox}
                >
                  <X aria-hidden="true" />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="project-image-lightbox__nav project-image-lightbox__nav--prev"
                      aria-label="上一張"
                      onClick={showPrevious}
                    >
                      <CaretLeft aria-hidden="true" weight="bold" />
                    </button>
                    <button
                      type="button"
                      className="project-image-lightbox__nav project-image-lightbox__nav--next"
                      aria-label="下一張"
                      onClick={showNext}
                    >
                      <CaretRight aria-hidden="true" weight="bold" />
                    </button>
                  </>
                )}

                <div className="project-image-lightbox__stage">
                  <Image
                    src={images[lightboxIndex]}
                    alt={`${title}完工作品空間 ${lightboxIndex + 2}`}
                    fill
                    priority
                    sizes="100vw"
                  />
                </div>

                <p className="project-image-lightbox__counter">
                  {lightboxIndex + 1} / {images.length}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
