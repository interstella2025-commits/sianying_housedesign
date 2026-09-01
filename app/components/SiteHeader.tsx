"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { navItems } from "../data";
import { BrandMark } from "./BrandMark";
import { ExternalPopupLink } from "./ExternalPopupLink";
import { SiteLink } from "./SiteLink";

type SiteHeaderProps = {
  integrated?: boolean;
};

const subscribeToClient = () => () => {};

export function SiteHeader({ integrated = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const mobileMenu = (
    <div
      className={`mobile-menu${integrated ? " mobile-menu-integrated" : ""}`}
      id="mobile-menu"
      data-open={open}
      aria-hidden={!open}
    >
      <nav aria-label="手機導覽">
        {navItems.map((item, index) =>
          item.external ? (
            <ExternalPopupLink
              key={item.label}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              style={{ "--menu-index": index } as React.CSSProperties}
            >
              <span>{item.label}</span>
              <ArrowUpRight aria-hidden="true" />
            </ExternalPopupLink>
          ) : (
            <SiteLink
              key={item.label}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              style={{ "--menu-index": index } as React.CSSProperties}
            >
              <span>{item.label}</span>
            </SiteLink>
          ),
        )}
        <SiteLink
          href="/#contact"
          scroll={false}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          style={{ "--menu-index": navItems.length } as React.CSSProperties}
        >
          <span>預約丈量</span>
          <ArrowUpRight aria-hidden="true" />
        </SiteLink>
      </nav>
      <div className="mobile-menu-foot">
        <a href="tel:0222888123" tabIndex={open ? 0 : -1}>
          02-2288-8123
        </a>
        <span>新北市五股區西雲路189號</span>
      </div>
    </div>
  );

  return (
    <header className={`site-header${integrated ? " site-header-integrated" : ""}`}>
      <div className="header-inner">
        <SiteLink className="brand" href="/" aria-label="翔胤室內設計首頁">
          <BrandMark />
          <span className="brand-type">
            <strong>翔胤室內設計</strong>
            <small>SIANG YIN INTERIOR</small>
          </span>
        </SiteLink>

        <nav className="desktop-nav" aria-label="主要導覽">
          {navItems.map((item) =>
            item.external ? (
              <ExternalPopupLink key={item.label} href={item.href}>
                {item.label}
              </ExternalPopupLink>
            ) : (
              <SiteLink key={item.label} href={item.href}>
                {item.label}
              </SiteLink>
            ),
          )}
        </nav>

        <SiteLink className="header-cta" href="/#contact" scroll={false}>
          預約丈量
          <ArrowUpRight aria-hidden="true" weight="regular" />
        </SiteLink>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "關閉選單" : "開啟選單"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <List aria-hidden="true" />}
        </button>
      </div>

      {mounted ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
