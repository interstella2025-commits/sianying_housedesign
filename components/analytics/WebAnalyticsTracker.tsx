"use client";

import { useEffect } from "react";
import {
  ANALYTICS_EVENT,
  ATTRIBUTION_KEY,
  SESSION_KEY,
  SESSION_STARTED_KEY,
  VISITOR_KEY,
  type AnalyticsAttribution,
  type AnalyticsEventDetail,
} from "@/lib/analytics/client";

type PendingEvent = AnalyticsEventDetail & {
  pagePath: string;
  occurredAt: string;
};

function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getOrCreate(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const value = randomId();
  storage.setItem(key, value);
  return value;
}

function readAttribution(): AnalyticsAttribution {
  const params = new URLSearchParams(window.location.search);
  const current: AnalyticsAttribution = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    campaignId: params.get("campaign_id") || undefined,
    adGroupId: params.get("adgroup_id") || params.get("ad_group_id") || undefined,
    adId: params.get("ad_id") || undefined,
    gclid: params.get("gclid") || undefined,
  };
  const hasCurrent = Object.values(current).some(Boolean);
  const stored = window.localStorage.getItem(ATTRIBUTION_KEY);
  if (!hasCurrent && stored) {
    try {
      return JSON.parse(stored) as AnalyticsAttribution;
    } catch {
      return {};
    }
  }
  if (hasCurrent) window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
  return current;
}

function pagePath() {
  return `${window.location.pathname}${window.location.search}`.slice(0, 2048);
}

function sectionName(element: HTMLElement) {
  return (
    element.dataset.analyticsSection ||
    element.id ||
    element.getAttribute("aria-labelledby") ||
    "section"
  ).slice(0, 160);
}

export default function WebAnalyticsTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    let visitorId: string;
    let sessionId: string;
    let startedAt: string;
    let attribution: AnalyticsAttribution;
    try {
      visitorId = getOrCreate(window.localStorage, VISITOR_KEY);
      sessionId = getOrCreate(window.sessionStorage, SESSION_KEY);
      startedAt = window.sessionStorage.getItem(SESSION_STARTED_KEY) || new Date().toISOString();
      window.sessionStorage.setItem(SESSION_STARTED_KEY, startedAt);
      attribution = readAttribution();
    } catch {
      visitorId = randomId();
      sessionId = randomId();
      startedAt = new Date().toISOString();
      attribution = {};
    }

    const queue: PendingEvent[] = [];
    const observedSections = new Set<string>();
    const startedForms = new WeakSet<HTMLFormElement>();
    const startedMs = Date.now();
    let flushTimer = 0;
    let maxScrollDepth = 0;

    const payload = () => ({
      visitorId,
      sessionId,
      startedAt,
      landingUrl: window.location.href.slice(0, 2048),
      referrer: document.referrer.slice(0, 2048) || undefined,
      viewportWidth: window.innerWidth,
      attribution,
      events: queue.splice(0, queue.length),
    });

    const flush = (beacon = false) => {
      window.clearTimeout(flushTimer);
      if (!queue.length) return;
      const body = JSON.stringify(payload());
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
        return;
      }
      void fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    };

    const enqueue = (detail: AnalyticsEventDetail, immediate = false) => {
      queue.push({ ...detail, pagePath: pagePath(), occurredAt: new Date().toISOString() });
      if (immediate || queue.length >= 8) flush();
      else {
        window.clearTimeout(flushTimer);
        flushTimer = window.setTimeout(() => flush(), 1200);
      }
    };

    const onTrackedEvent = (event: Event) => {
      enqueue((event as CustomEvent<AnalyticsEventDetail>).detail, true);
    };
    window.addEventListener(ANALYTICS_EVENT, onTrackedEvent);

    enqueue({
      name: "page_view",
      data: { title: document.title.slice(0, 200), screenWidth: window.screen.width },
    }, true);

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const name = sectionName(element);
        const key = `${pagePath()}:${name}`;
        if (observedSections.has(key)) return;
        observedSections.add(key);
        enqueue({ name: "section_view", sectionId: name });
        sectionObserver.unobserve(element);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll<HTMLElement>("main section, [data-analytics-section]")
      .forEach((element) => sectionObserver.observe(element));

    const scrollMarkers = [25, 50, 75, 90].map((depth) => {
      const marker = document.createElement("span");
      marker.dataset.analyticsScrollDepth = String(depth);
      marker.setAttribute("aria-hidden", "true");
      marker.style.cssText = "position:absolute;left:0;width:1px;height:1px;pointer-events:none;opacity:0";
      document.body.appendChild(marker);
      return marker;
    });
    const positionMarkers = () => {
      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      scrollMarkers.forEach((marker) => {
        marker.style.top = `${Math.max(0, height * Number(marker.dataset.analyticsScrollDepth) / 100)}px`;
      });
    };
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const depth = Number((entry.target as HTMLElement).dataset.analyticsScrollDepth || 0);
        if (depth <= maxScrollDepth) return;
        maxScrollDepth = depth;
        enqueue({ name: "scroll_depth", data: { depth } });
        scrollObserver.unobserve(entry.target);
      });
    });
    scrollMarkers.forEach((marker) => scrollObserver.observe(marker));
    positionMarkers();
    const resizeObserver = new ResizeObserver(positionMarkers);
    resizeObserver.observe(document.body);

    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const form = target.closest("form");
      if (!form || startedForms.has(form)) return;
      startedForms.add(form);
      enqueue({ name: "form_start", data: { formId: form.id || "contact" } });
    };
    document.addEventListener("focusin", onFocus);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.href;
      if (href.startsWith("tel:")) enqueue({ name: "phone_click", data: { href } }, true);
      else if (/lin\.ee|line\.me/i.test(href)) enqueue({ name: "line_click", data: { href } }, true);
      else if (link.hash === "#consultation") enqueue({ name: "consultation_click", data: { label: link.textContent?.trim().slice(0, 80) || "CTA" } });
    };
    document.addEventListener("click", onClick);

    const finishSession = () => {
      const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const finalDepth = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / Math.max(documentHeight, 1)) * 100));
      maxScrollDepth = Math.max(maxScrollDepth, finalDepth);
      enqueue({
        name: "session_end",
        data: { durationSeconds: Math.round((Date.now() - startedMs) / 1000), depth: maxScrollDepth },
      });
      flush(true);
    };
    window.addEventListener("pagehide", finishSession);

    return () => {
      window.clearTimeout(flushTimer);
      window.removeEventListener(ANALYTICS_EVENT, onTrackedEvent);
      window.removeEventListener("pagehide", finishSession);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("click", onClick);
      sectionObserver.disconnect();
      scrollObserver.disconnect();
      resizeObserver.disconnect();
      scrollMarkers.forEach((marker) => marker.remove());
      flush(true);
    };
  }, []);

  return null;
}
