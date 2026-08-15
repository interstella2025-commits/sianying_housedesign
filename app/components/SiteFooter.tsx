import Link from "next/link";
import {
  ArrowUpRight,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { contact, navItems, routes } from "../data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-lead" data-reveal>
        <p>
          有裝修需求？
          <br />
          歡迎透過 LINE 與我們聯絡。
        </p>
        <a className="footer-contact-link" href={contact.lineUrl} target="_blank" rel="noreferrer">
          LINE 線上諮詢
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            翔
          </span>
          <div>
            <strong>翔胤室內設計</strong>
            <p>住宅與商業空間設計、裝修工程、舊屋翻修及毛胚屋規劃。</p>
          </div>
        </div>

        <nav className="footer-nav" aria-label="頁尾導覽">
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
          <Link href={routes.privacy}>隱私權政策</Link>
        </nav>

        <div className="footer-contact">
          <a href="tel:0222888123">{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p>{contact.headquarters}</p>
          <p>{contact.designCenter}</p>
        </div>

        <div className="footer-social" aria-label="社群連結">
          <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
            <FacebookLogo aria-hidden="true" />
          </a>
          <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
            <InstagramLogo aria-hidden="true" />
          </a>
          <a href={contact.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
            <YoutubeLogo aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>統一編號 {contact.companyId}</span>
        <span>Copyright © 2017-2026 翔胤室內設計有限公司</span>
      </div>
    </footer>
  );
}
