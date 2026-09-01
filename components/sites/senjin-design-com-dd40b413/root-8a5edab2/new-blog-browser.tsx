"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { editorialStories } from "@/data/siangyin";

type StoryCategory = "ALL" | "AWARD" | "PRESS";

const categories: { value: StoryCategory; label: string }[] = [
  { value: "ALL", label: "全部文章（2）" },
  { value: "AWARD", label: "國際獎項（1）" },
  { value: "PRESS", label: "媒體報導（1）" },
];

const storyTags = {
  AWARD: ["室內設計", "國際獎項", "住宅空間"],
  PRESS: ["室內設計", "住宅空間", "設計師專訪"],
} as const;

const tags = ["室內設計", "國際獎項", "住宅空間", "設計師專訪"] as const;

export function NewBlogBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoryCategory>("ALL");
  const [tag, setTag] = useState<string | null>(null);

  const visibleStories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return editorialStories.filter((story) => {
      const categoryMatch = category === "ALL" || story.category === category;
      const tagMatch = !tag || storyTags[story.category].some((item) => item === tag);
      const searchText = `${story.title} ${story.english} ${story.category === "AWARD" ? "國際獎項" : "媒體報導"}`.toLocaleLowerCase();
      return categoryMatch && tagMatch && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [category, query, tag]);

  return (
    <div className="new-blog-browser">
      <aside className="new-blog-sidebar">
        <h1>消息</h1>
        <p>Blog</p>
        <label>
          <span className="sr-only">搜尋文章</span>
          <input
            type="search"
            name="blogSearch"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋文章"
            autoComplete="off"
          />
          <MagnifyingGlass aria-hidden="true" />
        </label>
        <div>
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
        <div>
          <h2>文章標籤｜</h2>
          <ul>
            {tags.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  aria-pressed={tag === item}
                  onClick={() => setTag((current) => current === item ? null : item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
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
            <button type="button" onClick={() => { setQuery(""); setCategory("ALL"); setTag(null); }}>
              清除搜尋條件
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
