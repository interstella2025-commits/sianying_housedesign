import { getAnalyticsContext, trackAnalyticsEvent } from "@/lib/analytics/client";

export type InquiryPayload = {
  formType: "consultation" | "reservation";
  name: string;
  phone: string;
  email?: string;
  houseAge?: string;
  location?: string;
  budget?: string;
  projectType?: string;
  message?: string;
  lineId?: string;
  sourcePath: string;
  submittedAt: number;
  website?: string;
};

export async function saveInquiry(payload: InquiryPayload) {
  const analytics = getAnalyticsContext();
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, ...analytics }),
  });

  if (!response.ok) {
    throw new Error(`Inquiry request failed with ${response.status}`);
  }

  trackAnalyticsEvent({
    name: "form_success",
    data: { formType: payload.formType, sourcePath: payload.sourcePath },
  });
}
