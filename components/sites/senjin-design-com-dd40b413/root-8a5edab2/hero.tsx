"use client";

import {
  ChatCircleDots,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetRoot, company, navigation } from "@/data/siangyin";

const downwardKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        "a, button, input, select, textarea, summary, [contenteditable='true']",
      ),
    )
  );
}

const socialLinks = [
  { label: "Instagram", href: company.instagram, Icon: InstagramLogo },
  { label: "Facebook", href: company.facebook, Icon: FacebookLogo },
  { label: "YouTube", href: company.youtube, Icon: YoutubeLogo },
  { label: "LINE", href: company.lineUrl, Icon: ChatCircleDots },
] as const;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const hasHandledDownwardIntent = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const moveToContent = () => {
      if (hasHandledDownwardIntent.current) return false;

      const hero = heroRef.current;
      const content = document.getElementById("content");
      if (!hero || !content) return false;

      const heroRect = hero.getBoundingClientRect();
      const isHeroActive =
        heroRect.bottom > 0 && heroRect.top > -heroRect.height * 0.35;
      if (!isHeroActive) return false;

      hasHandledDownwardIntent.current = true;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      content.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && !event.ctrlKey && moveToContent()) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        downwardKeys.has(event.key) &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !isInteractiveTarget(event.target) &&
        moveToContent()
      ) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches.item(0)?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const startY = touchStartY.current;
      const endY = event.changedTouches.item(0)?.clientY;
      touchStartY.current = null;
      if (
        startY !== null &&
        endY !== undefined &&
        startY - endY >= 44 &&
        moveToContent()
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[35rem] overflow-hidden bg-[#151515]"
    >
      <h1 id="hero-title" className="sr-only">
        翔胤室內設計｜讓室內空間與生活密不可分
      </h1>
      <Image
        src={`${assetRoot}/hero.jpg`}
        alt="翔胤室內設計打造的明亮現代住宅空間"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent_48%,rgba(0,0,0,0.08)_64%,rgba(0,0,0,0.72)_100%)]"
      />
      <span
        id="about"
        aria-hidden="true"
        className="section-anchor absolute bottom-0 left-0 size-px"
      />

      <div className="absolute top-[clamp(3rem,7.5vh,5.25rem)] right-[clamp(2.5rem,5.25vw,8rem)] bottom-[clamp(6rem,15vh,9rem)] z-10 hidden w-[11.6rem] flex-col justify-between md:flex">
        <div>
          <nav aria-label="首屏導覽">
            <ul className="m-0 flex list-none flex-col gap-[clamp(0.65rem,1.4vh,1.2rem)] p-0">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-block py-0.5 font-[family-name:var(--font-montserrat)] text-[clamp(1rem,1.35vw,1.42rem)] font-light tracking-[0.02em] text-white/84 transition-[opacity,transform] duration-300 hover:translate-x-1 hover:opacity-55 motion-reduce:transition-none"
                  >
                    {item.english}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-[clamp(1rem,2.3vh,1.75rem)] flex items-center gap-3 text-white/82">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="transition-opacity duration-300 hover:opacity-55"
              >
                <Icon aria-hidden="true" size={22} weight="regular" />
              </a>
            ))}
          </div>
        </div>

        <div className="text-white/86">
          <div className="mb-6 flex items-center gap-3">
            <span className="relative size-[5.25rem] shrink-0">
              <Image
                src={`${assetRoot}/brand/logo.png`}
                alt=""
                fill
                sizes="84px"
                className="object-contain brightness-0 invert"
              />
            </span>
            <p className="m-0 text-[clamp(1.2rem,1.8vw,1.85rem)] leading-[1.35] font-light tracking-[0.1em]">
              翔胤<br />設計
            </p>
          </div>
          {["SIANG YIN", "Design Consulting", company.philosophy].map((line) => (
            <p
              key={line}
              className="m-0 border-b border-white/52 py-3 font-[family-name:var(--font-montserrat)] text-[0.62rem] tracking-[0.03em]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute top-7 right-7 z-10 flex flex-col items-end text-white md:hidden">
        <p className="m-0 text-xl font-light tracking-[0.15em]">翔胤</p>
        <p className="mt-1 mb-0 font-[family-name:var(--font-montserrat)] text-[0.48rem] tracking-[0.15em] uppercase">
          Interior Design
        </p>
      </div>

      <div className="absolute right-6 bottom-9 left-6 z-10 md:hidden">
        <p className="max-w-[12rem] text-lg leading-relaxed font-light tracking-[0.1em] text-white/90">
          {company.philosophy}
        </p>
      </div>

      <a
        href="#content"
        aria-label="前往網站內容"
        className="absolute bottom-[4.5%] left-1/2 z-10 grid size-10 -translate-x-1/2 place-items-center text-xl text-white/86 transition-transform hover:translate-y-1 motion-reduce:transition-none"
      >
        ↓
      </a>
    </section>
  );
}
