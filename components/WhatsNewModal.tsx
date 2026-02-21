"use client";

import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

type WhatsNewModalProps = {
  open: boolean;
  onClose: () => void;
  versionLabel: string;
  updates: string[];
};

export default function WhatsNewModal({ open, onClose, versionLabel, updates }: WhatsNewModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="What’s new"
        className="fixed z-50 top-1/2 left-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="h-9 w-9 rounded-xl border border-border bg-muted/30 grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="truncate">What’s new</span>
              <span className="text-xs text-muted-foreground font-medium">{versionLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Here’s what changed:</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4">
          <ul className="space-y-2">
            {updates.map((u, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="leading-5">{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}