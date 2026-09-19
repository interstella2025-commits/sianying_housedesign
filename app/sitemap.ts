import type { MetadataRoute } from "next";

import { getStoredProjects } from "@/lib/cms/projects-store";

const siteUrl = "https://sianying-housedesign.vercel.app";

const staticRoutes = [
  "",
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/projects/new",
  "/projects/all",
  "/projects/residential",
  "/projects/commercial",
  "/projects/panorama",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const projects = await getStoredProjects();
  const routes = [
    ...staticRoutes,
    ...projects.map((project) => `/projects/${project.slug}` as const),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/blog" ? "monthly" : "yearly",
    priority: route === "" ? 1 : route.startsWith("/projects/") ? 0.8 : 0.6,
  }));
}
