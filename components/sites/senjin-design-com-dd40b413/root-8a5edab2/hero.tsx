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
        className="hero-camera-move object-cover object-center"
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

      <div className="hero-overlay-panel">
        <div className="hero-overlay-primary">
          <nav aria-label="首屏導覽" className="hero-overlay-nav">
            <ul className="m-0 flex list-none flex-col p-0">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="font-[family-name:var(--font-montserrat)] tracking-[0.02em] text-white/84 transition-[opacity,transform] duration-300 hover:translate-x-1 hover:opacity-55 motion-reduce:transition-none"
                  >
                    {item.english}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hero-social-links text-white/82">
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

        <div className="hero-brand-panel text-white/86">
          <div className="hero-brand-lockup">
            <span className="hero-brand-mark relative shrink-0">
              <Image
                src={`${assetRoot}/brand/logo.png`}
                alt=""
                fill
                sizes="84px"
                className="object-contain"
              />
            </span>
            <p className="hero-brand-name m-0 font-light">
              翔胤<br />設計
            </p>
          </div>
          <div className="hero-brand-lines">
            {["SIANG YIN", "Design Consulting", company.philosophy].map((line) => (
              <p
                key={line}
                className="m-0 border-b border-white/52 font-[family-name:var(--font-montserrat)] tracking-[0.03em]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#content"
        aria-label="前往網站內容"
        className="hero-scroll-cue transition-transform hover:translate-y-1 motion-reduce:transition-none"
      >
        ↓
      </a>
    </section>
  );
}
