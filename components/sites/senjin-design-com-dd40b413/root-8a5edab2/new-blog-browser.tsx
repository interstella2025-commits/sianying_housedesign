"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { editorialStories } from "@/data/siangyin";

type StoryCategory = "ALL" | "AWARD" | "PRESS";

const categories: { value: StoryCategory; label: string }[] = [
  { value: "ALL", label: "全部文章（2）" },
  { value: "AWARD", label: "國際獎項（1）" },
  { value: "PRESS", label: "媒體報導（1）" },
];

export function NewBlogBrowser() {
  const [category, setCategory] = useState<StoryCategory>("ALL");

  const visibleStories = useMemo(() => {
    return editorialStories.filter((story) => {
      return category === "ALL" || story.category === category;
    });
  }, [category]);

  return (
    <div className="new-blog-browser">
      <aside className="new-blog-sidebar">
        <h1>消息</h1>
        <p>Blog</p>
        <div className="new-blog-categories">
          <h2>文章分類｜</h2>
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              className="new-blog-filter"
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="new-blog-grid" aria-label="消息文章" aria-live="polite">
        {visibleStories.length ? visibleStories.map((story, index) => (
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
                sizes="(max-width: 760px) 100vw, 42vw"
              />
            </a>
            <time>{story.date}</time>
            <h3>
              <a href={story.href} target="_blank" rel="noreferrer">{story.title}</a>
            </h3>
          </article>
        )) : (
          <div className="new-blog-empty">
            <p>目前沒有符合條件的文章。</p>
            <button type="button" onClick={() => setCategory("ALL")}>
              清除搜尋條件
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
