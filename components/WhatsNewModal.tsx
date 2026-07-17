"use client";

import React, { useEffect } from "react";
import { Sparkles, X } from "lucide-react";

type WhatsNewModalProps = {
  open: boolean;
  onClose: () => void;
  versionLabel: string;
  updates: string[];
};

export default function WhatsNewModal({
  open,
  onClose,
  versionLabel,
  updates,
}: WhatsNewModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 cursor-default bg-black/45"
        onClick={onClose}
        aria-label="Close update"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div>
                <h2
                  id="whats-new-title"
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  MyStudyPlanner just got better
                </h2>
                <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {versionLabel}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="app-iconbtn shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-3">
            {updates.map((update) => (
              <div
                key={update}
                className="rounded-xl border border-border bg-background/55 px-4 py-3 text-sm leading-6 text-foreground"
              >
                {update}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft/60 p-4">
            <div className="text-sm font-semibold text-foreground">
              Help shape what comes next
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Found a problem, have an idea, or want something added? Every message is
              read and carefully considered. Your feedback directly influences what we
              improve and build next.
            </p>
            <p className="mt-3 break-all text-sm font-semibold text-foreground">
              mystudyplanner.studio@gmail.com
            </p>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="app-btn-primary w-full">
            Continue to planner
          </button>
        </footer>
      </section>
    </>
  );
}