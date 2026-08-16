import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

export function HomeHeroScrollLink() {
  return (
    <a className="home-hero-scroll home-hero-mobile-only" href="#works">
      <span className="home-hero-scroll-label">直接看3D空間作品</span>
      <ArrowDown aria-hidden="true" className="home-hero-scroll-arrow" weight="regular" />
    </a>
  );
}
