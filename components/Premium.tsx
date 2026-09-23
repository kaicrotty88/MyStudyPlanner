"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { trackProductEvent } from "@/lib/productAnalytics";

type Interval = "monthly" | "yearly";

export function Premium({ appMode, plan, isSignedIn }: { appMode: "app" | "demo"; plan: "free" | "premium"; isSignedIn: boolean }) {
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");
  const isPreview = appMode === "demo";
  const isPremium = plan === "premium" && !isPreview;

  const startCheckout = async (interval: Interval) => {
    if (isPreview || isPremium) return;
    setBillingError("");
    setBillingLoading(true);
    trackProductEvent("premium_checkout_started", { interval });
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) throw new Error(data?.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Could not start checkout.");
      setBillingLoading(false);
    }
  };

  const openBillingPortal = async () => {
    if (!isPremium) return;
    setBillingError("");
    setBillingLoading(true);
    trackProductEvent("premium_portal_opened");
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) throw new Error(data?.error ?? "Could not open billing management.");
      window.location.href = data.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Could not open billing management.");
      setBillingLoading(false);
    }
  };

  return (
    <div className="app-page app-scroll-page space-y-5">
      <div className="space-y-1">
        <h1 className="app-page-title">Premium</h1>
        <p className="app-page-subtitle">Connect the study you do to the results you get.</p>
      </div>

      <div className="app-card space-y-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" /> See what Premium adds</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Your planning stays free. Premium shows your progress.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Record assessment results, see performance by subject, and review how your preparation connects to each result.</p>
          </div>
          <span className="app-pill">{isPreview ? "Demo includes Premium" : isPremium ? "Your plan: Premium" : "Your plan: Free"}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Marks and results</div>
            <h3 className="mt-2 text-base font-semibold text-foreground">See the result alongside the preparation</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter a mark for an assessment, then review your results, subject averages and recent performance in one place.</p>
            <Link href="/demo?view=marks" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Explore Marks in the demo <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Study Insights</div>
            <h3 className="mt-2 text-base font-semibold text-foreground">Understand your study patterns</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Review completed sessions, subject breakdowns, streaks and assessment-linked study trends.</p>
            <Link href="/demo?view=study-insights" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Explore Insights in the demo <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          <span className="font-semibold text-foreground">Free:</span> Calendar, tasks, assessments, study planning, timer and imports. <span className="font-semibold text-foreground">Premium:</span> Marks, subject performance and deeper Study Insights.
        </div>
      </div>

      <div className="app-card space-y-4 p-5 sm:p-7">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Both plans include the same Premium features. Cancel through billing management when you need to.</p>
        </div>
        {isPreview ? (
          <Link href={isSignedIn ? "/app?view=premium" : "/sign-up"} className="app-btn-primary">{isSignedIn ? "Back to your Premium page" : "Create an account to upgrade"}</Link>
        ) : isPremium ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Premium is active on your account.</p>
            <button type="button" disabled={billingLoading} onClick={() => void openBillingPortal()} className="app-btn-primary">{billingLoading ? "Opening billing..." : "Manage or cancel subscription"}</button>
            <p className="text-xs text-muted-foreground">You keep Premium until the end of your paid billing period if you cancel.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={billingLoading} onClick={() => void startCheckout("monthly")} className="rounded-2xl border border-border bg-background/50 p-5 text-left hover:border-border-strong disabled:opacity-60">
              <span className="text-sm font-semibold text-foreground">Monthly</span><span className="mt-2 block text-2xl font-semibold text-foreground">US$2.99</span><span className="text-xs text-muted-foreground">per month, billed monthly</span><span className="mt-4 block text-xs font-semibold text-primary">Choose monthly</span>
            </button>
            <button type="button" disabled={billingLoading} onClick={() => void startCheckout("yearly")} className="rounded-2xl border border-primary/40 bg-primary-soft/50 p-5 text-left hover:bg-primary-soft disabled:opacity-60">
              <span className="text-sm font-semibold text-foreground">Yearly · Best value</span><span className="mt-2 block text-2xl font-semibold text-foreground">US$19.99</span><span className="text-xs text-muted-foreground">per year, billed yearly</span><span className="mt-4 block text-xs font-semibold text-primary">Save US$15.89, about 44%</span>
            </button>
          </div>
        )}
        {billingLoading && !isPremium ? <p className="text-xs text-muted-foreground">Opening secure checkout...</p> : null}
        {billingError ? <p role="alert" className="text-sm text-destructive">{billingError}</p> : null}
        <p className="text-xs leading-5 text-muted-foreground">Subscriptions renew automatically at the selected interval until cancelled. Manage or cancel from this page.</p>
      </div>
    </div>
  );
}
