"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { PanoramaViewer } from "@/app/components/PanoramaViewer";

type PortfolioProjectMediaProps = {
  title: string;
  description: string;
  image: string;
  panorama?: string;
};

const projectImageSizes = "(min-width: 760px) 584px, calc(100vw - 48px)";

export function PortfolioProjectMedia({
  title,
  description,
  image,
  panorama,
}: PortfolioProjectMediaProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [shouldRenderPanorama, setShouldRenderPanorama] = useState(false);

  useEffect(() => {
    if (!panorama || !mediaRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShouldRenderPanorama(entry.isIntersecting),
      { rootMargin: "220px 0px", threshold: 0.01 },
    );

    observer.observe(mediaRef.current);
    return () => observer.disconnect();
  }, [panorama]);

  const alt = `翔胤室內設計作品「${title}」：${description}`;

  if (!panorama) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes={projectImageSizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
      />
    );
  }

  return (
    <div ref={mediaRef} className="absolute inset-0" data-panorama="true">
      {shouldRenderPanorama ? (
        <PanoramaViewer
          src={panorama}
          poster={image}
          className="portfolio-panorama"
          autoRotate={0.02}
          hint="360° 拖曳環視"
          ariaLabel={`${title} 360 度環景瀏覽`}
        />
      ) : (
        <>
          <Image
            src={image}
            alt={alt}
            fill
            sizes={projectImageSizes}
            className="object-cover"
          />
          <span className="portfolio-panorama-badge" aria-hidden="true">
            <span>360° PANORAMA</span>
            <small>拖曳環視</small>
          </span>
        </>
      )}
    </div>
  );
}
