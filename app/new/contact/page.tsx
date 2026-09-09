import type { Metadata } from "next";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { NewContactContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-contact-content";
import { getPageSettings } from "@/lib/cms/pages";

export const metadata: Metadata = {
  title: "聯絡我們｜翔胤室內設計",
  description: "聯絡翔胤室內設計，預約空間丈量與設計需求討論。",
  alternates: { canonical: "/new/contact" },
};

export default async function NewContactPage() {
  const settings = await getPageSettings("/new/contact");
  return (
    <InnerPageShell tone="dark" showFooter={false}>
      <NewContactContent settings={settings} />
    </InnerPageShell>
  );
}
