import { ContactFooter } from "./contact-footer";
import { EditorialStories } from "./editorial-stories";
import { SelectedWorks } from "./selected-works";
import { SiteShell } from "./site-shell";
import { PageSupplements } from "@/components/cms/page-supplements";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

export function NewHomeContent({ settings }: { settings: SianyingPageSettings | null }) {
  return (
    <SiteShell heroSettings={settings}>
      <EditorialStories />
      <SelectedWorks />
      <PageSupplements settings={settings} />
      <ContactFooter />
    </SiteShell>
  );
}
