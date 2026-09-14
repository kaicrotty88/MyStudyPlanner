"use client";

import React, { useEffect, useState } from "react";
import { Check, Download, Laptop, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setShowManualHelp(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
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
                : "Add MyStudyPlanner to your laptop or phone and open it in its own app window."}
            </div>
          </div>
        </div>

        {!installed ? (
          <button type="button" onClick={() => void install()} className="app-btn-secondary h-9 shrink-0 px-3">
            <Download className="h-4 w-4" />
            Install app
          </button>
        ) : (
          <span className="app-pill w-fit">Installed</span>
        )}
      </div>

      {showManualHelp && !installed ? (
        <div className="border-t border-border px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Laptop className="h-4 w-4" /> Laptop
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                Look for Install / Add to Dock in your browser menu. Chrome and Edge may also show an install icon in the address bar.
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Smartphone className="h-4 w-4" /> iPhone / iPad
              </div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                In Safari, tap Share, then Add to Home Screen. It will launch without the normal browser interface.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}