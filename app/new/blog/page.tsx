import type { Metadata } from "next";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { NewBlogBrowser } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-blog-browser";
import { getPageSettings } from "@/lib/cms/pages";
import { PageSupplements } from "@/components/cms/page-supplements";

export const metadata: Metadata = {
  title: "消息與媒體｜翔胤室內設計",
  description: "翔胤室內設計國際獎項、媒體採訪與設計消息。",
  alternates: { canonical: "/new/blog" },
};

export default async function NewBlogPage() {
  const settings = await getPageSettings("/new/blog");
  return (
    <InnerPageShell tone="light">
      <div className="new-blog-page">
        <header className="new-project-index-intro">
          <h1>{settings?.title || "消息與媒體"}</h1>
          <h2>{settings?.subtitle || "Blog"}</h2>
          <span>{settings?.eyebrow || "JOURNAL"}</span>
          <p>{settings?.description || "翔胤室內設計國際獎項、媒體採訪與設計消息。"}</p>
        </header>
        <NewBlogBrowser />
        <PageSupplements settings={settings} />
      </div>
    </InnerPageShell>
  );
}
