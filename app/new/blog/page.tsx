import type { Metadata } from "next";
import Image from "next/image";

import { InnerPageShell } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/inner-page-shell";
import { editorialStories } from "@/data/siangyin";

export const metadata: Metadata = {
  title: "消息與媒體｜翔胤室內設計",
  description: "翔胤室內設計國際獎項、媒體採訪與設計消息。",
  alternates: { canonical: "/new/blog" },
};

export default function NewBlogPage() {
  return (
    <InnerPageShell tone="light">
      <div className="new-blog-page">
        <aside className="new-blog-sidebar">
          <h1>消息</h1>
          <p>Blog</p>
          <label>
            <span className="sr-only">搜尋文章</span>
            <input type="search" aria-label="搜尋文章" />
            <b aria-hidden="true">⌕</b>
          </label>
          <div>
            <h2>文章分類｜</h2>
            <p>國際獎項（1）</p>
            <p>媒體報導（1）</p>
          </div>
          <div>
            <h2>文章標籤｜</h2>
            <ul>
              <li>室內設計</li>
              <li>國際獎項</li>
              <li>住宅空間</li>
              <li>設計師專訪</li>
            </ul>
          </div>
        </aside>

        <section className="new-blog-grid" aria-label="消息文章">
          {editorialStories.map((story, index) => (
            <article key={story.href}>
              <header>
                <h2>{story.category === "AWARD" ? "國際獎項" : "媒體報導"}</h2>
                <a href={story.href} target="_blank" rel="noreferrer">MORE</a>
              </header>
              <a href={story.href} target="_blank" rel="noreferrer" className="new-blog-media">
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  priority={index === 0}
                  unoptimized
                  sizes="(max-width: 760px) 100vw, 42vw"
                />
              </a>
              <time>{story.date}</time>
              <h3>
                <a href={story.href} target="_blank" rel="noreferrer">{story.title}</a>
              </h3>
            </article>
          ))}
        </section>
      </div>
    </InnerPageShell>
  );
}
