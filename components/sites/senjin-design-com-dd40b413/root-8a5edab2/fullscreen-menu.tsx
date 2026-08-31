"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, RefObject } from "react";
import { useEffect, useRef } from "react";

import {
  assetRoot,
  company,
  navigation,
  projectNavigation,
} from "@/data/siangyin";

type FullscreenMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function FullscreenMenu({
  isOpen,
  onClose,
  triggerRef,
}: FullscreenMenuProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const triggerElement = triggerRef.current;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableItems = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));
      const firstItem = focusableItems[0];
      const lastItem = focusableItems.at(-1);

      if (!firstItem || !lastItem) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      triggerElement?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      ref={dialogRef}
      id="site-navigation-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-navigation-title"
      aria-hidden={!isOpen}
      inert={!isOpen}
      onMouseDown={closeFromBackdrop}
      className={`site-menu-dialog${isOpen ? " is-open" : ""}`}
    >
      <div className="site-menu-backdrop" aria-hidden="true" />
      <div className="site-menu-frame">
        <div className="site-menu-header">
          <Link
            href="/new"
            onClick={onClose}
            className="site-menu-brand"
            aria-label="翔胤室內設計新版首頁"
          >
            <span className="site-menu-brand-mark">
              <Image
                src={`${assetRoot}/brand/logo.png`}
                alt=""
                fill
                sizes="58px"
                className="object-contain"
              />
            </span>
            <span>
              翔胤室內設計
              <small>{company.englishName}</small>
            </span>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="site-menu-close"
            aria-label="關閉導覽選單"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <nav aria-labelledby="site-navigation-title" className="site-menu-navigation">
          <h2 id="site-navigation-title" className="sr-only">
            網站導覽
          </h2>
          <ul className="site-menu-main-list">
            {navigation.map((item) => {
              const isWorks = item.english === "WORKS";
              const isActive = isWorks
                ? pathname.startsWith("/new/projects")
                : pathname === item.href;

              return (
                <li key={item.href} className={isWorks ? "site-menu-works-item" : undefined}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`site-menu-main-link${isActive ? " is-active" : ""}`}
                  >
                    <span>{item.english}</span>
                    <small>{item.label}</small>
                  </Link>

                  {isWorks ? (
                    <ul className="site-menu-project-list" aria-label="作品分類">
                      {projectNavigation.map((projectItem) => (
                        <li key={projectItem.href}>
                          <Link href={projectItem.href} onClick={onClose}>
                            <span>{projectItem.label}</span>
                            <small>{projectItem.english}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-menu-footer">
          <div>
            <a href={company.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href={company.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={company.youtube} target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
          <p>© 2026 {company.englishName}</p>
        </div>
      </div>
    </div>
  );
}
