"use client";

import type { MouseEvent, RefObject } from "react";
import { useEffect, useRef } from "react";

import { company, navigation } from "@/data/siangyin";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

      if (event.key !== "Tab") {
        return;
      }

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
    if (event.target === event.currentTarget) {
      onClose();
    }
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
      className={`fixed inset-0 z-[100] flex overflow-y-auto bg-[rgba(17,17,17,0.97)] px-7 py-7 transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-10 sm:py-9 lg:px-16 lg:py-12 motion-reduce:transition-none ${
        isOpen
          ? "visible translate-x-0 opacity-100"
          : "invisible pointer-events-none -translate-x-5 opacity-0"
      }`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[1220px] flex-col">
        <div className="flex items-start justify-between gap-6">
          <a
            href="#top"
            onClick={onClose}
            className="inline-flex flex-col py-2 transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
          >
            <span className="text-xl font-light tracking-[0.14em] sm:text-2xl">
              翔胤
            </span>
            <span className="mt-1 font-[family-name:var(--font-montserrat)] text-[0.5rem] tracking-[0.17em] text-[var(--paper-soft)] uppercase">
              {company.englishName}
            </span>
          </a>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="group relative grid size-12 shrink-0 cursor-pointer place-items-center border border-[var(--line)] bg-transparent transition-[opacity,transform] duration-300 hover:rotate-3 hover:opacity-60 motion-reduce:transition-none"
            aria-label="關閉導覽選單"
          >
            <span
              aria-hidden="true"
              className="absolute h-px w-5 rotate-45 bg-[var(--paper)]"
            />
            <span
              aria-hidden="true"
              className="absolute h-px w-5 -rotate-45 bg-[var(--paper)]"
            />
          </button>
        </div>

        <nav
          aria-labelledby="site-navigation-title"
          className="flex flex-1 items-center py-14 sm:py-16"
        >
          <div>
            <p
              id="site-navigation-title"
              className="mb-8 font-[family-name:var(--font-montserrat)] text-[0.62rem] tracking-[0.22em] text-[var(--paper-soft)] uppercase"
            >
              Navigation
            </p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 sm:gap-4">
              {navigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-4 py-1 text-[clamp(1.8rem,5.5vw,4.8rem)] leading-[1.08] font-light tracking-[0.05em] transition-[opacity,transform] duration-500 hover:translate-x-2 hover:opacity-55 motion-reduce:transition-none"
                  >
                    <span className="w-6 font-[family-name:var(--font-montserrat)] text-[0.55rem] tracking-[0.12em] text-[var(--paper-soft)] sm:w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.english}</span>
                    <span className="hidden text-[0.75rem] tracking-[0.12em] text-[var(--paper-soft)] sm:inline">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="flex flex-col gap-5 border-t border-[var(--line)] pt-6 text-[0.6rem] tracking-[0.16em] text-[var(--paper-soft)] uppercase sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-6 font-[family-name:var(--font-montserrat)]">
            <a
              href={company.facebook}
              target="_blank"
              rel="noreferrer"
              className="py-1 transition-opacity duration-300 hover:opacity-55 motion-reduce:transition-none"
            >
              Facebook
            </a>
            <a
              href={company.instagram}
              target="_blank"
              rel="noreferrer"
              className="py-1 transition-opacity duration-300 hover:opacity-55 motion-reduce:transition-none"
            >
              Instagram
            </a>
          </div>
          <p className="m-0 font-[family-name:var(--font-montserrat)]">
            © {company.founded}—2026 {company.englishName}
          </p>
        </div>
      </div>
    </div>
  );
}
