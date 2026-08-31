import Image from "next/image";

import {
  company,
  editorialStories,
  serviceGroups,
} from "@/data/siangyin";

import { Reveal } from "./reveal";

const companyFacts = [
  { label: "成立", value: company.founded, suffix: "年" },
  { label: "實務經驗", value: company.experience, suffix: "年" },
  { label: "創辦人", value: company.founder, suffix: "" },
  { label: "設計理念", value: company.philosophy, suffix: "" },
] as const;

export function EditorialStories() {
  return (
    <>
      <section
        id="news"
        aria-labelledby="news-title"
        className="section-anchor border-b border-[var(--line)] py-24 sm:py-28 lg:py-36"
      >
        <div className="site-container">
          <Reveal>
            <h2 id="news-title" className="section-title">
              最新消息
              <span aria-hidden="true">NEWS</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid max-w-[591px] grid-cols-2 gap-4 sm:mt-16 sm:gap-10">
            {editorialStories.map((story, index) => (
              <Reveal key={story.href} delay={120 + index * 120}>
                <article
                  id={index === 0 ? "awards" : undefined}
                  className={index === 0 ? "section-anchor" : undefined}
                >
                  <a
                    href={story.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${story.title}（在新分頁開啟）`}
                    className="group block"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#171717]">
                      <Image
                        src={story.image}
                        alt={story.alt}
                        fill
                        sizes="(min-width: 640px) 275px, calc((100vw - 72px) / 2)"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none"
                      />
                    </div>
                    <p className="mt-5 font-[family-name:var(--font-montserrat)] text-[0.62rem] tracking-[0.16em] text-[var(--paper-soft)] sm:mt-6 sm:text-[0.67rem]">
                      {story.english}
                    </p>
                    <h3 className="mt-2 text-sm font-light leading-relaxed tracking-[0.035em] underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-base">
                      {story.title}
                    </h3>
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="about-title"
        className="section-anchor py-24 sm:py-28 lg:py-40"
      >
        <div className="site-container">
          <Reveal>
            <h2 id="about-title" className="section-title">
              關於翔胤
              <span aria-hidden="true">ABOUT SIANG YIN</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-16 lg:mt-20 lg:grid-cols-[minmax(0,1.16fr)_minmax(280px,0.84fr)] lg:gap-28">
            <Reveal delay={120}>
              <div>
                <p className="max-w-2xl text-xl font-light leading-[1.85] tracking-[0.04em] sm:text-2xl lg:text-[1.75rem]">
                  {company.philosophy}
                </p>
                <p className="mt-8 max-w-2xl text-sm leading-[2.05] tracking-[0.04em] text-[var(--paper-soft)] sm:text-base">
                  {company.about}
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 border-t border-[var(--line)]">
              {companyFacts.map((fact, index) => (
                <Reveal key={fact.label} delay={180 + index * 80}>
                  <dl className="min-h-32 border-b border-[var(--line)] py-5 pr-3 sm:min-h-36 sm:py-6">
                    <dt className="text-xs tracking-[0.12em] text-[var(--paper-soft)]">
                      {fact.label}
                    </dt>
                    <dd className="mt-3 break-words font-[family-name:var(--font-montserrat)] text-lg font-light leading-relaxed tracking-[0.02em] sm:text-xl">
                      {fact.value}
                      {fact.suffix ? (
                        <span className="ml-1 text-xs text-[var(--paper-soft)]">
                          {fact.suffix}
                        </span>
                      ) : null}
                    </dd>
                  </dl>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={220} className="mt-20 sm:mt-24 lg:mt-32">
            <div className="grid border-t border-[var(--line)] md:grid-cols-[0.7fr_1.3fr]">
              <div className="py-7 md:py-9 md:pr-10">
                <p className="eyebrow text-[var(--paper-soft)]">SERVICES</p>
                <p className="mt-3 text-lg font-light tracking-[0.04em]">服務內容</p>
              </div>

              <div className="grid border-t border-[var(--line)] sm:grid-cols-2 md:border-l md:border-t-0 md:border-[var(--line)]">
                {serviceGroups.map((group) => (
                  <section
                    key={group.title}
                    aria-labelledby={`service-${group.title}`}
                    className="border-b border-[var(--line)] px-0 py-7 last:border-b-0 sm:border-b-0 sm:border-l sm:px-8 sm:first:border-l-0 md:px-10"
                  >
                    <h3
                      id={`service-${group.title}`}
                      className="text-base font-normal tracking-[0.08em]"
                    >
                      {group.title}
                    </h3>
                    <ul className="mt-5 space-y-2.5 text-sm leading-relaxed tracking-[0.035em] text-[var(--paper-soft)]">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default EditorialStories;
