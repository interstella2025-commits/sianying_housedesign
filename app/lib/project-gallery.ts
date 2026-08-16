import galleryAssets from "../project-gallery-assets.json";
import { projects, type Project } from "../data";

type GalleryAsset = {
  slug: string;
  images: string[];
  panorama?: string;
  cover?: string;
};

export type GalleryProject = Project & {
  slug: string;
  gallery: string[];
  panorama?: string;
  cover?: string;
};

const assets = galleryAssets as GalleryAsset[];

export const galleryProjects: GalleryProject[] = assets.map((asset, index) => ({
  ...projects[index],
  slug: asset.slug,
  gallery: asset.images,
  panorama: asset.panorama,
  cover: asset.cover,
}));

export function getGalleryThumbnails(project: GalleryProject): string[] {
  if (project.cover) {
    return project.gallery.filter((image) => image !== project.cover);
  }

  return project.gallery.slice(1);
}

export const totalGalleryImages = assets.reduce(
  (sum, asset) => sum + asset.images.length,
  0,
);
