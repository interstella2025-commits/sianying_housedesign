"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type SiteLinkProps = ComponentProps<typeof Link>;

function shouldScrollToTop(href: SiteLinkProps["href"]) {
  if (typeof href !== "string") return true;
  return !href.includes("#");
}

export function SiteLink({ href, onClick, scroll, ...props }: SiteLinkProps) {
  const scrollToTop = scroll ?? shouldScrollToTop(href);

  return (
    <Link
      href={href}
      scroll={scrollToTop}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (scrollToTop && typeof href === "string" && !href.includes("#")) {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }}
      {...props}
    />
  );
}
