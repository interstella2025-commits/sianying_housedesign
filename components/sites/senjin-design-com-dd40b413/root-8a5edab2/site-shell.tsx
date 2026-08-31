"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

import { assetRoot, company } from "@/data/siangyin";

import { FullscreenMenu } from "./fullscreen-menu";
import { Hero } from "./hero";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>

      <Hero />

      <div id="content" className="relative bg-[var(--ink)]">
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(31,31,31,0.94)] backdrop-blur-md">
          <div className="site-container flex h-[76px] items-center justify-between gap-6">
            <a
              href="#top"
              className="group inline-flex min-w-0 items-center gap-3 py-2 transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
              aria-label="返回首頁頂端"
            >
              <span className="relative size-10 shrink-0 overflow-hidden">
                <Image
                  src={`${assetRoot}/brand/logo.png`}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-light tracking-[0.13em]">
                  {company.name}
                </span>
                <span className="mt-0.5 hidden truncate font-[family-name:var(--font-montserrat)] text-[0.46rem] tracking-[0.16em] text-[var(--paper-soft)] uppercase sm:block">
                  {company.englishName}
                </span>
              </span>
            </a>

            <button
              ref={menuTriggerRef}
              type="button"
              onClick={openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="site-navigation-dialog"
              aria-label="開啟導覽選單"
              className="group flex min-h-12 min-w-12 cursor-pointer items-center justify-end gap-3 bg-transparent px-0 py-2 text-[var(--paper)]"
            >
              <span className="hidden font-[family-name:var(--font-montserrat)] text-[0.57rem] tracking-[0.2em] uppercase sm:inline">
                Menu
              </span>
              <span className="flex w-6 flex-col items-end gap-[6px]" aria-hidden="true">
                <span className="h-px w-6 bg-current transition-[opacity,transform] duration-300 group-hover:-translate-x-1 group-hover:opacity-65 motion-reduce:transition-none" />
                <span className="h-px w-4 bg-current transition-[opacity,transform] duration-300 group-hover:w-6 group-hover:opacity-65 motion-reduce:transition-none" />
              </span>
            </button>
          </div>
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
