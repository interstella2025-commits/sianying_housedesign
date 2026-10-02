"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { ExternalPopupLink } from "@/app/components/ExternalPopupLink";
import { editorialStories } from "@/data/siangyin";
import type { SianyingPageSettings } from "@/lib/puck/page-settings";

type StoryCategory = "ALL" | "AWARD" | "PRESS";

export function NewBlogBrowser({ settings }: { settings: SianyingPageSettings | null }) {
  const [category, setCategory] = useState<StoryCategory>("ALL");
  const stories = settings?.stories?.length ? settings.stories : editorialStories;
  const categories: { value: StoryCategory; label: string }[] = [
    { value: "ALL", label: `全部文章（${stories.length}）` },
    { value: "AWARD", label: `國際獎項（${stories.filter((story) => story.category === "AWARD").length}）` },
    { value: "PRESS", label: `媒體報導（${stories.filter((story) => story.category === "PRESS").length}）` },
  ];

  const visibleStories = useMemo(() => {
    return stories.filter((story) => {
      return category === "ALL" || story.category === category;
    });
  }, [category, stories]);

  return (
    <div className="new-blog-browser">
      <aside className="new-blog-sidebar">
        <h2 className="new-blog-sidebar-title">{settings?.blogSidebarTitle || "消息"}</h2>
        <p>{settings?.blogSidebarSubtitle || "Blog"}</p>
        <div className="new-blog-categories">
          <h2>{settings?.blogCategoryTitle || "文章分類｜"}</h2>
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
              <ExternalPopupLink
                href={story.href}
                popupTitle={story.title}
                aria-haspopup="dialog"
                aria-label={`閱讀「${story.title}」`}
              >
                MORE
              </ExternalPopupLink>
            </header>
            <ExternalPopupLink
              href={story.href}
              popupTitle={story.title}
              aria-haspopup="dialog"
              aria-label={`閱讀「${story.title}」`}
              className="new-blog-media"
            >
              <Image
                src={story.image}
                alt={("imageAlt" in story ? story.imageAlt : story.alt) || ""}
                fill
                priority={index === 0}
                sizes="(max-width: 760px) 100vw, 42vw"
              />
            </ExternalPopupLink>
            <time>{story.date}</time>
            <h3>
              <ExternalPopupLink
                href={story.href}
                popupTitle={story.title}
                aria-haspopup="dialog"
              >
                {story.title}
              </ExternalPopupLink>
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
