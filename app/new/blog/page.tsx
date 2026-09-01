import type { Metadata } from "next";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { NewBlogBrowser } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-blog-browser";

export const metadata: Metadata = {
  title: "消息與媒體｜翔胤室內設計",
  description: "翔胤室內設計國際獎項、媒體採訪與設計消息。",
  alternates: { canonical: "/new/blog" },
};

export default function NewBlogPage() {
  return (
    <InnerPageShell tone="light">
      <div className="new-blog-page">
        <NewBlogBrowser />
      </div>
    </InnerPageShell>
  );
}
