import type { MetadataRoute } from "next";

import { galleryProjects } from "@/app/lib/project-gallery";

const siteUrl = "https://sianying-housedesign.vercel.app";

const staticRoutes = [
  "",
  "/about",
  "/awards",
  "/services",
  "/press",
  "/privacy",
  "/works",
  "/new",
  "/new/about",
  "/new/blog",
  "/new/contact",
  "/new/projects/new",
  "/new/projects/all",
  "/new/projects/residential",
  "/new/projects/commercial",
  "/new/projects/panorama",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    ...staticRoutes,
    ...galleryProjects.map((project) => `/new/projects/${project.slug}` as const),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/new/blog" ? "monthly" : "yearly",
    priority: route === "/new" ? 1 : route.startsWith("/new/projects/") ? 0.8 : 0.6,
  }));
}
