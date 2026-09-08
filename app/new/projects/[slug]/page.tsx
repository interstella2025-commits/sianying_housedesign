import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { galleryProjects } from "@/app/lib/project-gallery";
import { ProjectDetailPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-detail-page";
import { getStoredProjects } from "@/lib/cms/projects-store";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return galleryProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getStoredProjects()).find((item) => item.slug === slug);

  if (!project) return {};

  const description = project.paragraphs[0];
  const previewImage = project.cover ?? project.gallery[0];

  return {
    title: `${project.title}｜翔胤室內設計`,
    description,
    alternates: {
      canonical: `/new/projects/${project.slug}`,
    },
    openGraph: {
      title: `${project.title}｜${project.english}`,
      description,
      url: `/new/projects/${project.slug}`,
      images: [{ url: previewImage, alt: `${project.title}室內設計完工作品` }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projects = await getStoredProjects();
  const projectIndex = projects.findIndex((project) => project.slug === slug);

  if (projectIndex < 0) notFound();

  const project = projects[projectIndex];

  return (
    <ProjectDetailPage
      project={project}
      previousProject={projects[projectIndex - 1]}
      nextProject={projects[projectIndex + 1]}
    />
  );
}
