import Image from "next/image";

import { editorialStories } from "@/data/siangyin";

import { Reveal } from "./reveal";

export function EditorialStories() {
  return (
    <section id="news" aria-labelledby="news-title" className="section-anchor pb-24">
      <div className="portfolio-column">
        <Reveal>
          <h2 id="news-title" className="portfolio-section-title">
            News
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
          {editorialStories.map((story, index) => (
            <Reveal key={story.href} delay={100 + index * 100}>
              <article>
                <a
                  href={story.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${story.title}（在新分頁開啟）`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#151515]">
                    <Image
                      src={story.image}
                      alt={story.alt}
                      fill
                      sizes="(min-width: 640px) 272px, calc(100vw - 48px)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </div>
                  <p className="mt-3 flex justify-between gap-3 font-[family-name:var(--font-montserrat)] text-[0.62rem] tracking-[0.16em] text-[var(--paper-soft)]">
                    <span>{story.date}</span>
                    <span>{story.category}</span>
                  </p>
                  <h3 className="mt-2 text-[0.76rem] leading-[1.85] font-light tracking-[0.06em] text-[var(--paper)] group-hover:underline group-hover:underline-offset-4">
                    {story.title}
                  </h3>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EditorialStories;
