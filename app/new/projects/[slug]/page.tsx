import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { galleryProjects } from "@/app/lib/project-gallery";
import { ProjectDetailPage } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/project-detail-page";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function getProject(slug: string) {
  return galleryProjects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return galleryProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

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
  const projectIndex = galleryProjects.findIndex((project) => project.slug === slug);

  if (projectIndex < 0) notFound();

  const project = galleryProjects[projectIndex];

  return (
    <ProjectDetailPage
      project={project}
      previousProject={galleryProjects[projectIndex - 1]}
      nextProject={galleryProjects[projectIndex + 1]}
    />
  );
}
