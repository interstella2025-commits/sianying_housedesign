import type { Metadata } from "next";

import { NewAboutContent } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-about-content";
import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { getPageSettings } from "@/lib/cms/pages";

export const metadata: Metadata = {
  title: "關於翔胤｜翔胤室內設計",
  description: "翔胤室內設計成立於 2010 年，從格局、動線、材質與工程細節出發。",
  alternates: { canonical: "/new/about" },
};

export default async function NewAboutPage() {
  const settings = await getPageSettings("/new/about");
  return (
    <InnerPageShell tone="dark">
      <NewAboutContent settings={settings} />
    </InnerPageShell>
  );
}
