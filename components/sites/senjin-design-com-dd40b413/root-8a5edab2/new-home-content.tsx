import { ContactFooter } from "./contact-footer";
import { EditorialStories } from "./editorial-stories";
import { SelectedWorks } from "./selected-works";
import { SiteShell } from "./site-shell";

export function NewHomeContent() {
  return (
    <SiteShell>
      <EditorialStories />
      <SelectedWorks />
      <ContactFooter />
    </SiteShell>
  );
}
