"use client";

import Link from "next/link";
import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { navItems } from "../data";
import { BrandMark } from "./BrandMark";

type SiteHeaderProps = {
  integrated?: boolean;
};

export function SiteHeader({ integrated = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className={`site-header${integrated ? " site-header-integrated" : ""}`}>
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="翔胤室內設計首頁">
          <BrandMark />
          <span className="brand-type">
            <strong>翔胤室內設計</strong>
            <small>SIANG YIN INTERIOR</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主要導覽">
          {navItems.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <Link className="header-cta" href="/#contact">
          預約丈量
          <ArrowUpRight aria-hidden="true" weight="regular" />
        </Link>

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

      <div className="mobile-menu" id="mobile-menu" data-open={open} aria-hidden={!open}>
        <nav aria-label="手機導覽">
          {navItems.map((item, index) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={open ? 0 : -1}
                style={{ "--menu-index": index } as React.CSSProperties}
              >
                <span>{item.label}</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                style={{ "--menu-index": index } as React.CSSProperties}
              >
                <span>{item.label}</span>
              </Link>
            ),
          )}
        </nav>
        <div className="mobile-menu-foot">
          <a href="tel:0222888123" tabIndex={open ? 0 : -1}>
            02-2288-8123
          </a>
          <span>新北市五股區西雲路 189 號 1 樓</span>
        </div>
      </div>
    </header>
  );
}
