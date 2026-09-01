"use client";

import Image from "next/image";
import type { GalleryProject } from "../lib/project-gallery";
import { PanoramaViewer } from "./PanoramaViewer";

type ProjectCoverMediaProps = {
  project: GalleryProject;
  priority?: boolean;
  sizes?: string;
  autoRotate?: number;
  className?: string;
  imageIndex?: number;
  showHint?: boolean;
  preferStaticImage?: boolean;
};

export function ProjectCoverMedia({
  project,
  priority = false,
  sizes = "100vw",
  autoRotate = 0.035,
  className,
  imageIndex = 0,
  showHint = true,
  preferStaticImage = false,
}: ProjectCoverMediaProps) {
  if (project.panorama && !preferStaticImage) {
    const poster = project.cover ?? project.gallery[0];

    return (
      <PanoramaViewer
        src={project.panorama}
        poster={poster}
        className={className}
        autoRotate={autoRotate}
        showHint={showHint}
        posterPriority={priority}
      />
    );
  }

  const image =
    project.cover ??
    project.gallery[imageIndex] ??
    project.gallery[0];

  return (
    <Image
      src={image}
      alt={`${project.title}完工作品`}
      fill
      priority={priority}
      sizes={sizes}
    />
  );
}
