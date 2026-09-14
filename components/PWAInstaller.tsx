"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Download, Laptop, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __mspInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

function browserLabel() {
  if (typeof navigator === "undefined") return "browser";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "browser";
}

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const browser = useMemo(() => browserLabel(), []);

  useEffect(() => {
    setInstalled(isStandalone());
    setInstallPrompt(window.__mspInstallPrompt ?? null);

    const onAvailable = () => setInstallPrompt(window.__mspInstallPrompt ?? null);
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("msp-install-available", onAvailable);
    window.addEventListener("msp-app-installed", onInstalled);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("msp-install-available", onAvailable);
      window.removeEventListener("msp-app-installed", onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    const prompt = installPrompt ?? window.__mspInstallPrompt ?? null;
    if (!prompt) {
      setShowHelp(true);
      return;
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } finally {
      window.__mspInstallPrompt = null;
      setInstallPrompt(null);
    }
  };

  return (
    <div className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="settings-row-icon settings-icon-timetable">
            {installed ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Install MyStudyPlanner</div>
            <div className="text-xs leading-5 text-muted-foreground">
              {installed
                ? "Installed on this device. Open it from your apps like any other app."
                : "Install MyStudyPlanner on this device and open it in its own app window."}
            </div>
          </div>
        </div>

        {!installed ? (
          <button type="button" onClick={() => void install()} className="app-btn-secondary h-9 shrink-0 px-3">
            <Download className="h-4 w-4" />
            {installPrompt ? "Install app" : "How to install"}
          </button>
        ) : (
          <span className="app-pill w-fit">Installed</span>
        )}
      </div>

      {showHelp && !installed ? (
        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Install from {browser}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                Your browser did not expose its one-click install prompt, so use its built-in install option below.
              </div>
            </div>
            <button type="button" onClick={() => setShowHelp(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted" aria-label="Close install help">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Laptop className="h-4 w-4" /> Laptop
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                {browser === "Chrome"
                  ? "Open Chrome's three-dot menu, choose Cast, save and share, then Install page as app."
                  : browser === "Edge"
                    ? "Open Edge's three-dot menu, choose Apps, then Install MyStudyPlanner."
                    : "In Safari, use File → Add to Dock. In Chrome or Edge, use the browser's Install page as app option."}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Smartphone className="h-4 w-4" /> iPhone / iPad
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                Open MyStudyPlanner in Safari, tap Share, then Add to Home Screen. It will launch without the normal browser interface.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}