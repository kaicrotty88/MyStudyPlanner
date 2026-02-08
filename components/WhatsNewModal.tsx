"use client";

import React from "react";

export type WhatsNewItem = {
  title: string;
  body: string;
};

export function WhatsNewModal({
  open,
  versionLabel,
  items,
  feedbackEmail,
  onClose,
}: {
  open: boolean;
  versionLabel: string;
  items: WhatsNewItem[];
  feedbackEmail: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const mailto = `mailto:${feedbackEmail}?subject=${encodeURIComponent(
    "MyStudyPlanner feedback"
  )}&body=${encodeURIComponent("Hey! Here's some feedback / a suggestion:\n\n")}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-lg font-semibold">What’s new</div>
              <div className="text-xs text-muted-foreground">{versionLabel}</div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-muted transition"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-border/70 bg-background/40 p-3">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground mt-1 leading-5">{it.body}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/70 bg-background/40 p-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">Send feedback</div>
              <div className="text-muted-foreground text-xs">{feedbackEmail}</div>
            </div>
            <a
              href={mailto}
              className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-muted transition"
            >
              Email
            </a>
          </div>

          <div className="text-[12px] text-muted-foreground">
            If you had tasks before sync: open the app on the device where they exist to import them.
          </div>
        </div>
      </div>
    </div>
  );
}
