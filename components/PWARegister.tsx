"use client";

import { useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __mspInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PWARegister() {
  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__mspInstallPrompt = event as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event("msp-install-available"));
    };

    const onAppInstalled = () => {
      window.__mspInstallPrompt = null;
      window.dispatchEvent(new Event("msp-app-installed"));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .catch((error) => {
          console.warn("PWA service worker registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return null;
}