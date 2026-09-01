import Image from "next/image";
import Link from "next/link";

import { ExternalPopupLink } from "@/app/components/ExternalPopupLink";
import { editorialStories } from "@/data/siangyin";

import { Reveal } from "./reveal";

export function EditorialStories() {
  return (
    <section id="news" aria-labelledby="news-title" className="section-anchor pb-24">
      <div className="portfolio-column editorial-column">
        <Reveal>
          <h2 id="news-title" className="portfolio-section-title">
            <Link href="/new/blog">News</Link>
          </h2>
        </Reveal>

        <div className="editorial-grid">
          {editorialStories.map((story, index) => (
            <Reveal key={story.href} delay={100 + index * 100}>
              <article className="editorial-story">
                <ExternalPopupLink
                  href={story.href}
                  popupTitle={story.title}
                  aria-haspopup="dialog"
                  aria-label={`${story.title}（開啟彈出視窗）`}
                  className="group block"
                >
                  <div className="editorial-media relative overflow-hidden bg-[#151515]">
                    <Image
                      src={story.image}
                      alt={story.alt}
                      fill
                      sizes="(min-width: 640px) 272px, calc(100vw - 48px)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </div>
                  <p className="editorial-meta flex justify-between gap-3 font-[family-name:var(--font-montserrat)] text-[0.62rem] tracking-[0.16em] text-[var(--paper-soft)]">
                    <span>{story.date}</span>
                    <span>{story.category}</span>
                  </p>
                  <h3 className="editorial-story-title font-light tracking-[0.06em] text-[var(--paper)] group-hover:underline group-hover:underline-offset-4">
                    {story.title}
                  </h3>
                </ExternalPopupLink>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EditorialStories;
