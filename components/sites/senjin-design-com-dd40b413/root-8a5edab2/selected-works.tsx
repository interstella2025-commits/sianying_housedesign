import Image from "next/image";

import { projects } from "@/data/siangyin";

import { Reveal } from "./reveal";

const projectImageSizes =
  "(min-width: 1440px) 590px, (min-width: 900px) calc((100vw - 120px) / 2), (min-width: 640px) calc(100vw - 80px), calc(100vw - 56px)";

export function SelectedWorks() {
  return (
    <section
      id="works"
      className="section-anchor border-t border-[var(--line)] py-24 sm:py-32"
      aria-labelledby="works-heading"
    >
      <div className="site-container">
        <Reveal>
          <h2 id="works-heading" className="section-title">
            精選作品
            <span>SELECTED WORKS</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 min-[900px]:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.number} delay={(index % 2) * 120}>
              <figure className="group min-w-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ink-deep)]">
                  <Image
                    src={project.image}
                    alt={`翔胤室內設計作品「${project.title}」：${project.description}`}
                    fill
                    sizes={projectImageSizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                <figcaption className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-[var(--line)] py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-6">
                  <span
                    className="eyebrow pt-1 text-[var(--paper-soft)]"
                    aria-label={`作品編號 ${project.number}`}
                  >
                    {project.number}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-lg font-light tracking-[0.08em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-8 sm:text-xl">
                      {project.title}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-montserrat)] text-[0.66rem] tracking-[0.15em] text-[var(--paper-soft)] uppercase sm:text-xs">
                      {project.english}
                    </p>
                    <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--paper-soft)]">
                      {project.description}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
