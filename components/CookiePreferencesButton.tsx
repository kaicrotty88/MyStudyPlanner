"use client";

import { OPEN_PREFERENCES_EVENT } from "@/components/CookieConsent";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
    >
      Cookie preferences
    </button>
  );
}
