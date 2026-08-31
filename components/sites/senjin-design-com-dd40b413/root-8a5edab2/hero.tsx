"use client";

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

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const hasHandledDownwardIntent = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const moveToContent = () => {
      if (hasHandledDownwardIntent.current) {
        return false;
      }

      const hero = heroRef.current;
      const content = document.getElementById("content");

      if (!hero || !content) {
        return false;
      }

      const heroRect = hero.getBoundingClientRect();
      const isHeroActive = heroRect.bottom > 0 && heroRect.top > -heroRect.height * 0.35;

      if (!isHeroActive) {
        return false;
      }

      hasHandledDownwardIntent.current = true;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      content.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || event.ctrlKey) {
        return;
      }

      if (moveToContent()) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !downwardKeys.has(event.key) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isInteractiveTarget(event.target)
      ) {
        return;
      }

      if (moveToContent()) {
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

      if (startY === null || endY === undefined || startY - endY < 44) {
        return;
      }

      if (moveToContent()) {
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
      className="relative grid h-[100svh] min-h-[34rem] overflow-hidden bg-[var(--ink-deep)] min-[720px]:grid-cols-[66%_34%] min-[1100px]:grid-cols-[74%_26%]"
    >
      <div className="relative min-h-0 overflow-hidden">
        <Image
          src={`${assetRoot}/hero.jpg`}
          alt="翔胤室內設計打造的明亮現代住宅空間"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[57%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/30"
        />

        <div className="absolute inset-x-7 bottom-9 z-10 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-11 min-[720px]:inset-x-12 min-[720px]:bottom-12">
          <div className="max-w-[34rem] opacity-100 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none">
            <p className="mb-4 font-[family-name:var(--font-montserrat)] text-[0.64rem] tracking-[0.23em] text-white/76 uppercase">
              Since {company.founded} · New Taipei City
            </p>
            <h1
              id="hero-title"
              className="m-0 max-w-[12em] text-[clamp(1.65rem,4vw,3.6rem)] leading-[1.24] font-light tracking-[0.08em] text-white"
            >
              {company.philosophy}
            </h1>
          </div>

          <a
            href="#content"
            className="group flex shrink-0 flex-col items-center gap-3 py-2 text-white/82"
            aria-label="前往網站內容"
          >
            <span className="font-[family-name:var(--font-montserrat)] text-[0.58rem] tracking-[0.22em] uppercase [writing-mode:vertical-rl]">
              Scroll
            </span>
            <span
              aria-hidden="true"
              className="h-11 w-px origin-top bg-white/72 transition-[opacity,transform] duration-500 group-hover:scale-y-75 group-hover:opacity-60 motion-reduce:transition-none"
            />
          </a>
        </div>
      </div>

      <aside className="relative hidden min-[720px]:flex min-[720px]:flex-col min-[720px]:justify-between min-[720px]:border-l min-[720px]:border-white/10 min-[720px]:bg-[#202020] min-[720px]:px-[clamp(1.75rem,3vw,3.35rem)] min-[720px]:py-[clamp(2.5rem,6vh,4.5rem)]">
        <nav aria-label="首屏導覽">
          <ul className="m-0 flex list-none flex-col gap-[clamp(1rem,2.2vh,1.65rem)] p-0">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group inline-flex items-baseline gap-3 py-1 text-[0.71rem] tracking-[0.18em] text-[var(--paper)] uppercase transition-[opacity,transform] duration-500 hover:translate-x-1 hover:opacity-65 motion-reduce:transition-none"
                >
                  <span className="font-[family-name:var(--font-montserrat)]">
                    {item.english}
                  </span>
                  <span className="text-[0.66rem] tracking-[0.1em] text-[var(--paper-soft)]">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <div className="mb-7 flex gap-5 font-[family-name:var(--font-montserrat)] text-[0.58rem] tracking-[0.16em] text-[var(--paper-soft)] uppercase">
            <a
              href={company.facebook}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity duration-300 hover:opacity-55 motion-reduce:transition-none"
            >
              Facebook
            </a>
            <a
              href={company.instagram}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity duration-300 hover:opacity-55 motion-reduce:transition-none"
            >
              Instagram
            </a>
          </div>
          <p className="m-0 text-[clamp(1.35rem,2.1vw,2.35rem)] leading-[1.18] font-light tracking-[0.12em] text-[var(--paper)]">
            翔胤
          </p>
          <p className="mt-2 mb-0 font-[family-name:var(--font-montserrat)] text-[0.57rem] tracking-[0.18em] text-[var(--paper-soft)] uppercase">
            {company.englishName}
          </p>
        </div>
      </aside>

      <div className="pointer-events-none absolute top-7 right-7 z-10 text-right min-[720px]:hidden">
        <p className="m-0 text-xl font-light tracking-[0.14em] text-white">翔胤</p>
        <p className="mt-1 mb-0 font-[family-name:var(--font-montserrat)] text-[0.5rem] tracking-[0.16em] text-white/72 uppercase">
          Interior Design
        </p>
      </div>
    </section>
  );
}
