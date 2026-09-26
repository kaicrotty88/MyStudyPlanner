"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  type ConsentChoice,
  readConsent,
} from "@/components/ConsentAnalytics";

const OPEN_PREFERENCES_EVENT = "msp:open-cookie-preferences";

function saveConsent(analytics: boolean) {
  const value: ConsentChoice = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setVisible(pathname === "/app" || pathname.startsWith("/app/"));
    else setAnalytics(existing.analytics);

    const openPreferences = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setShowPreferences(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, [pathname]);

  if (!visible) return null;

  const commit = (allowAnalytics: boolean) => {
    saveConsent(allowAnalytics);
    setAnalytics(allowAnalytics);
    setShowPreferences(false);
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-[100] rounded-2xl border border-border bg-card p-4 shadow-xl sm:inset-x-auto sm:right-5 sm:w-[390px]"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="space-y-3">
        <div>
          <h2 id="cookie-consent-title" className="text-base font-semibold text-foreground">
            {showPreferences ? "Cookie and analytics preferences" : "Your privacy choices"}
          </h2>
          <p id="cookie-consent-description" className="mt-1 text-sm leading-6 text-muted-foreground">
            Allow optional analytics to help us improve the planner? Necessary storage stays on either way.
          </p>
        </div>

        {showPreferences ? (
          <div className="space-y-3 rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-foreground">Necessary</div>
                <div className="mt-0.5 text-xs leading-5 text-muted-foreground">Required for sign-in, security and core app storage. Always on.</div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Required</span>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-border pt-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Analytics</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Allows Google Analytics, Vercel Analytics and first-party product analytics.</span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
              />
            </label>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link href="/cookies" className="underline underline-offset-2 hover:text-foreground">Cookie Policy</Link>
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {showPreferences ? (
              <button type="button" onClick={() => commit(analytics)} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Save preferences
              </button>
            ) : (
              <button type="button" onClick={() => setShowPreferences(true)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Preferences
              </button>
            )}
            <button type="button" onClick={() => commit(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Reject non-essential
            </button>
            <button type="button" onClick={() => commit(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Accept analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { OPEN_PREFERENCES_EVENT };
