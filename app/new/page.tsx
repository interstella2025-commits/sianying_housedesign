import { ContactFooter } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/contact-footer";
import { EditorialStories } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/editorial-stories";
import { SelectedWorks } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/selected-works";
import { SiteShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/site-shell";

export default function NewDesignPage() {
  return (
    <SiteShell>
      <EditorialStories />
      <SelectedWorks />
      <ContactFooter />
    </SiteShell>
  );
}
