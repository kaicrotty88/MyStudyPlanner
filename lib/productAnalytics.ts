"use client";

export type ProductEventName =
  | "app_opened"
  | "feature_opened"
  | "subject_created"
  | "task_created"
  | "timetable_class_created"
  | "study_session_created"
  | "study_session_completed"
  | "study_recommendation_started"
  | "marks_paywall_viewed"
  | "premium_viewed"
  | "premium_checkout_started"
  | "premium_portal_opened";

type ProductEventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackProductEvent(
  eventName: ProductEventName,
  properties: ProductEventProperties = {}
) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem("msp_cookie_consent_v1");
    const consent = raw ? JSON.parse(raw) as { analytics?: boolean } : null;
    if (consent?.analytics !== true) return;
  } catch {
    return;
  }

  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, properties: cleanProperties }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the planner experience.
  });
}