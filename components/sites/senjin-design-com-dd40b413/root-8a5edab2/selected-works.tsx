import Image from "next/image";

import { projects } from "@/data/siangyin";

import { Reveal } from "./reveal";

export function SelectedWorks() {
  return (
    <section id="works" className="section-anchor pb-28" aria-labelledby="works-heading">
      <div className="portfolio-column">
        <Reveal>
          <h2 id="works-heading" className="portfolio-section-title">
            New Projects
          </h2>
        </Reveal>

        <div className="mt-8 space-y-12 sm:space-y-14">
          {projects.map((project) => (
            <Reveal key={project.number}>
              <figure className="group m-0 min-w-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#151515]">
                  <Image
                    src={project.image}
                    alt={`翔胤室內設計作品「${project.title}」：${project.description}`}
                    fill
                    sizes="(min-width: 760px) 584px, calc(100vw - 48px)"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                  />
                </div>

                <figcaption className="pt-2.5 text-[var(--paper)]">
                  <div className="flex items-center justify-between gap-6 text-[0.68rem] tracking-[0.08em]">
                    <h3 className="m-0 font-light tracking-[0.08em]">
                      {project.title}
                    </h3>
                    <span className="shrink-0 font-[family-name:var(--font-montserrat)] text-[0.55rem] tracking-[0.16em] text-[var(--paper-soft)]">
                      PROJECT {project.number}
                    </span>
                  </div>
                  <p className="mt-1 font-[family-name:var(--font-montserrat)] text-[0.56rem] tracking-[0.13em] text-[var(--paper-soft)] uppercase">
                    {project.english}
                  </p>
                  <p className="mt-2 max-w-[34rem] text-[0.66rem] leading-[1.8] tracking-[0.04em] text-[var(--paper-soft)]">
                    {project.description}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
