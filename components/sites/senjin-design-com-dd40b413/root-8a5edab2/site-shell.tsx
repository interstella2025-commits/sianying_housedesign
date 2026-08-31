"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { assetRoot } from "@/data/siangyin";

import { FullscreenMenu } from "./fullscreen-menu";
import { Hero } from "./hero";

type SiteShellProps = { children: ReactNode };

export function SiteShell({ children }: SiteShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const content = document.getElementById("content");
        if (content) setIsCompact(content.getBoundingClientRect().top < -180);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>

      <Hero />

      <div id="content" className="relative bg-[#1d1d1d]">
        <header
          className={`sticky top-0 z-40 h-[10rem] transition-colors duration-500 sm:h-[12rem] ${
            isCompact ? "bg-[#1d1d1d]/84 backdrop-blur-sm" : "bg-[#1d1d1d]"
          }`}
        >
          <a
            href="#top"
            aria-label="返回首頁頂端"
            className={`absolute top-12 left-[var(--portfolio-gutter)] size-12 transition-opacity duration-500 hover:opacity-55 ${
              isCompact ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={`${assetRoot}/brand/logo.png`}
              alt=""
              fill
              sizes="48px"
              className="object-contain brightness-0 invert"
            />
          </a>

          <button
            ref={menuTriggerRef}
            type="button"
            onClick={openMenu}
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation-dialog"
            aria-label="開啟導覽選單"
            className="group absolute top-[2.9rem] right-[var(--portfolio-gutter)] flex size-14 cursor-pointer items-center justify-center bg-transparent text-[var(--paper)]"
          >
            <span className="flex w-12 flex-col items-end gap-[9px]" aria-hidden="true">
              <span className="h-px w-12 bg-current transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="h-px w-12 bg-current transition-transform duration-300 group-hover:translate-x-1" />
              <span className="h-px w-12 bg-current transition-transform duration-300 group-hover:-translate-x-1" />
            </span>
          </button>
        </header>

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>

      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
