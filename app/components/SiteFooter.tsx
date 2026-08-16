import {
  ArrowUpRight,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { contact, navItems, routes } from "../data";
import { BrandMark } from "./BrandMark";
import { ExternalPopupLink } from "./ExternalPopupLink";
import { SiteLink } from "./SiteLink";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-lead" data-reveal>
        <p>
          有裝修需求？
          <br />
          <span className="footer-lead-line">歡迎透過 LINE 與我們聯絡</span>
        </p>
        <ExternalPopupLink className="footer-contact-link" href={contact.lineUrl}>
          LINE 線上諮詢
          <ArrowUpRight aria-hidden="true" />
        </ExternalPopupLink>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <BrandMark />
          <div>
            <strong>翔胤室內設計</strong>
            <p>裝修工程、室內設計、商業空間、舊屋翻修、毛胚屋規劃</p>
          </div>
        </div>

        <nav className="footer-nav" aria-label="頁尾導覽">
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

        <div className="footer-contact">
          <a href="tel:0222888123">{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p><span>公司登記</span>{contact.headquarters}</p>
          <p><span>設計中心</span>{contact.designCenter}</p>
        </div>

        <div className="footer-social" aria-label="社群連結">
          <ExternalPopupLink href={contact.facebook} aria-label="Facebook">
            <FacebookLogo aria-hidden="true" />
          </ExternalPopupLink>
          <ExternalPopupLink href={contact.instagram} aria-label="Instagram">
            <InstagramLogo aria-hidden="true" />
          </ExternalPopupLink>
          <ExternalPopupLink href={contact.youtube} aria-label="YouTube">
            <YoutubeLogo aria-hidden="true" />
          </ExternalPopupLink>
        </div>
      </div>

      <div className="footer-bottom">
        <span>統一編號 {contact.companyId}</span>
        <div className="footer-bottom-legal">
          <SiteLink className="footer-privacy-link" href={routes.privacy}>
            隱私權政策
          </SiteLink>
          <span>Copyright © 2017-2026 翔胤室內設計有限公司</span>
        </div>
      </div>
    </footer>
  );
}
