"use client";

export const ANALYTICS_EVENT = "siangyin:analytics";
export const VISITOR_KEY = "sy_visitor_id";
export const SESSION_KEY = "sy_session_id";
export const SESSION_STARTED_KEY = "sy_session_started_at";
export const ATTRIBUTION_KEY = "sy_attribution";

export type AnalyticsAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  campaignId?: string;
  adGroupId?: string;
  adId?: string;
  gclid?: string;
};

export type AnalyticsEventDetail = {
  name: string;
  sectionId?: string;
  data?: Record<string, string | number | boolean | null>;
};

export function trackAnalyticsEvent(detail: AnalyticsEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AnalyticsEventDetail>(ANALYTICS_EVENT, { detail }));
}

export function getAnalyticsContext() {
  if (typeof window === "undefined") return {};
  try {
    const rawAttribution = window.localStorage.getItem(ATTRIBUTION_KEY);
    return {
      analyticsSessionId: window.sessionStorage.getItem(SESSION_KEY) || undefined,
      attribution: rawAttribution
        ? (JSON.parse(rawAttribution) as AnalyticsAttribution)
        : undefined,
    };
  } catch {
    return {};
  }
}
