"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

function resetWindowScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollToRouteTarget() {
  const hash = window.location.hash;

  if (hash) {
    const target = document.querySelector(hash);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ block: "start" });
      return;
    }
    return;
  }

  resetWindowScroll();
}

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank") return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.hash) return;
      if (nextUrl.pathname === window.location.pathname && !nextUrl.search) return;

      resetWindowScroll();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useLayoutEffect(() => {
    scrollToRouteTarget();

    const frame = window.requestAnimationFrame(() => {
      scrollToRouteTarget();
      ScrollTrigger.refresh();
    });

    const timers = [50, 120, 240, 420, 700].map((delay) =>
      window.setTimeout(() => {
        scrollToRouteTarget();
        if (delay >= 120) {
          ScrollTrigger.refresh();
        }
      }, delay),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}
