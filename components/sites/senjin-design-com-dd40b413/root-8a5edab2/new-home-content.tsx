import { ContactFooter } from "./contact-footer";
import { EditorialStories } from "./editorial-stories";
import { SelectedWorks } from "./selected-works";
import { ShortVideoShowcase } from "./short-video-showcase";
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
      <EditorialStories settings={settings} />
      <ShortVideoShowcase settings={settings} />
      <SelectedWorks projects={projects} settings={settings} />
      <PageSupplements settings={settings} />
      <ContactFooter settings={settings} />
    </SiteShell>
  );
}
