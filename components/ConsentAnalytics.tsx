"use client";

import { Suspense, useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalyticsPageView from "@/components/GoogleAnalyticsPageView";

export const CONSENT_STORAGE_KEY = "msp_cookie_consent_v1";
export const CONSENT_EVENT = "msp:consent-changed";
const GA_MEASUREMENT_ID = "G-1ZLJMK2TLL";

export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export default function ConsentAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAnalyticsAllowed(readConsent()?.analytics === true);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView />
      </Suspense>
      <Analytics />
    </>
  );
}
