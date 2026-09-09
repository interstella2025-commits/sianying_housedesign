import { PageSupplements } from "@/components/cms/page-supplements";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

import { NewBlogBrowser } from "./new-blog-browser";

export function NewBlogContent({ settings }: { settings: SianyingPageSettings | null }) {
  return (
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
  );
}
