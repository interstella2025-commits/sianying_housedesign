import "server-only";

import { galleryProjects } from "@/app/lib/project-gallery";
import { readCmsJson, writeCmsJson } from "@/lib/cms/storage.server";
import type { Project } from "@/lib/project-types";

const PROJECTS_KEY = "projects";
const commercialProjectNumbers = new Set(["06", "11"]);

function seedProjects(): Project[] {
  return galleryProjects.map((project) => ({
    ...project,
    english: project.english ?? "",
    paragraphs: project.paragraphs ?? [],
    cover: project.cover ?? project.gallery[0] ?? project.landscape,
    gallery: project.gallery ?? [],
    category: commercialProjectNumbers.has(project.number)
      ? "commercial"
      : "residential",
    published: true,
  }));
}

function normalizeProject(project: Project): Project {
  const gallery = Array.from(new Set((project.gallery ?? []).filter(Boolean)));
  const cover = project.cover || gallery[0] || project.landscape || "";
  return {
    ...project,
    slug: project.slug.trim().toLowerCase(),
    number: project.number.trim().padStart(2, "0"),
    title: project.title.trim(),
    english: project.english?.trim() ?? "",
    paragraphs: (project.paragraphs ?? []).map((item) => item.trim()).filter(Boolean),
    landscape: project.landscape || cover,
    portrait: project.portrait || cover,
    cover,
    gallery,
    panorama: project.panorama?.trim() || undefined,
    category: project.category === "commercial" ? "commercial" : "residential",
    published: project.published !== false,
  };
}

export async function getStoredProjects(options: { includeDrafts?: boolean } = {}) {
  const stored = await readCmsJson<Project[]>(PROJECTS_KEY);
  const projects = (stored?.length ? stored : seedProjects()).map(normalizeProject);
  return options.includeDrafts ? projects : projects.filter((project) => project.published);
}

export async function saveStoredProjects(projects: Project[]) {
  await writeCmsJson(PROJECTS_KEY, projects.map(normalizeProject));
}

export async function upsertStoredProject(project: Project) {
  const projects = await getStoredProjects({ includeDrafts: true });
  const normalized = normalizeProject(project);
  const index = projects.findIndex((item) => item.slug === normalized.slug);
  const next = index >= 0
    ? projects.map((item, itemIndex) => itemIndex === index ? normalized : item)
    : [normalized, ...projects];
  await saveStoredProjects(next);
  return next;
}

export async function deleteStoredProject(slug: string) {
  const projects = await getStoredProjects({ includeDrafts: true });
  const next = projects.filter((project) => project.slug !== slug);
  await saveStoredProjects(next);
  return next;
}
