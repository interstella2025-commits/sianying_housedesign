import { ContactFooter } from "./contact-footer";
import { EditorialStories } from "./editorial-stories";
import { SelectedWorks } from "./selected-works";
import { SiteShell } from "./site-shell";
import { PageSupplements } from "@/components/cms/page-supplements";
import type { Project } from "@/lib/project-types";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

type NewHomeContentProps = {
  settings: SianyingPageSettings | null;
  projects: Project[];
  editorPreview?: boolean;
};

export function NewHomeContent({ settings, projects, editorPreview = false }: NewHomeContentProps) {
  return (
    <SiteShell heroSettings={settings} editorPreview={editorPreview}>
      <EditorialStories />
      <SelectedWorks projects={projects} />
      <PageSupplements settings={settings} />
      <ContactFooter />
    </SiteShell>
  );
}
