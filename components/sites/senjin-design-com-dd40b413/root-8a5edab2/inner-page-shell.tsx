"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

import { assetRoot, company } from "@/data/siangyin";

import { FullscreenMenu } from "./fullscreen-menu";

type InnerPageShellProps = {
  children: ReactNode;
  tone?: "light" | "dark";
};

export function InnerPageShell({
  children,
  tone = "light",
}: InnerPageShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <div className={`new-page-shell is-${tone}`}>
      <a href="#new-page-content" className="skip-link">
        跳至主要內容
      </a>

      <header className="new-inner-header">
        <Link href="/new" className="new-inner-brand" aria-label="返回翔胤室內設計新版首頁">
          <span>
            <Image
              src={`${assetRoot}/brand/logo.png`}
              alt=""
              fill
              sizes="52px"
              className="object-contain"
            />
          </span>
          <small>{company.englishName}</small>
        </Link>

        <button
          ref={triggerRef}
          type="button"
          onClick={openMenu}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation-dialog"
          aria-label="開啟導覽選單"
          className="new-inner-menu-trigger"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </header>

      <main id="new-page-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="new-inner-footer">
        <div className="new-inner-footer-links">
          <Link href="/new">TOP</Link>
          <Link href="/new/contact">CONTACT</Link>
          <a href={company.facebook} target="_blank" rel="noreferrer">FACEBOOK</a>
          <a href={company.instagram} target="_blank" rel="noreferrer">INSTAGRAM</a>
          <a href={company.youtube} target="_blank" rel="noreferrer">YOUTUBE</a>
        </div>
        <p>© 2026 {company.englishName} · {company.companyId}</p>
      </footer>

      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        triggerRef={triggerRef}
      />
    </div>
  );
}
