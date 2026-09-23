import type { Metadata } from "next";
import Link from "next/link";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";

export const metadata: Metadata = {
  title: "Cookie & Analytics Policy | MyStudyPlanner",
  description: "How MyStudyPlanner uses necessary storage and optional analytics.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Cookie & Analytics Policy</h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">A plain-language explanation of browser storage, cookies and analytics used by MyStudyPlanner.</p>
        <p className="text-sm text-muted-foreground">Last updated: 23 September 2026</p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Necessary storage</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">Necessary cookies or browser storage can be used by MyStudyPlanner and authentication providers for sign-in, session security, saved preferences, demo data and core app operation. These cannot all be disabled from the cookie banner because doing so may prevent the service from working.</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Optional analytics</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">If you accept analytics, MyStudyPlanner may load Google Analytics and Vercel Analytics and may record limited first-party product events such as opening a feature or completing a study session. These analytics are intended to help understand product usage and reliability, not to serve behavioural advertising.</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Your choice</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">Analytics are off until you accept them. Rejecting optional analytics does not remove core planner features. You can change your choice later using the button below.</p>
          <CookiePreferencesButton className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" />
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">No advertising cookies</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">The current MyStudyPlanner implementation does not intentionally use advertising cookies, ad retargeting pixels or third-party behavioural advertising SDKs.</p>
        </section>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal pages">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Use</Link>
          <Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
        </nav>
      </div>
    </main>
  );
}
