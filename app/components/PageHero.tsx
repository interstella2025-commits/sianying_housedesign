import Image from "next/image";

type PageHeroProps = {
  kicker: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
};

export function PageHero({ kicker, title, summary, image, imageAlt }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <p className="section-kicker" data-hero-kicker>
          {kicker}
        </p>
        <h1>
          <span className="line-mask">
            <span data-hero-word>{title}</span>
          </span>
        </h1>
        <p className="page-hero-summary" data-hero-summary>
          {summary}
        </p>
      </div>
      <div className="page-hero-media" data-hero-media data-parallax>
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 899px) 100vw, 66vw"
        />
      </div>
    </section>
  );
}
