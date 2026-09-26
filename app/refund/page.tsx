import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Read the MyStudyPlanner Premium refund and cancellation policy, including subscription renewals, cancellation timing and how refund requests are handled.",
  alternates: { canonical: "/refund" },
  openGraph: {
    title: "Refund Policy | MyStudyPlanner",
    description: "Read the MyStudyPlanner Premium refund and cancellation policy, including subscription renewals, cancellation timing and how refund requests are handled.",
    url: "/refund",
    siteName: "MyStudyPlanner",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MyStudyPlanner study planner for students" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy | MyStudyPlanner",
    description: "Read the MyStudyPlanner Premium refund and cancellation policy, including subscription renewals, cancellation timing and how refund requests are handled.",
    images: ["/twitter-image"],
  },
};

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Refund Policy</h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">How cancellations and refund requests for MyStudyPlanner Premium are handled.</p>
        <p className="text-sm text-muted-foreground">Last updated: 23 September 2026</p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Cancelling Premium</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">You can cancel a Premium subscription through the Stripe billing page linked from MyStudyPlanner Settings. Cancellation stops future renewal. Unless a refund or other remedy applies, Premium access continues until the end of the period already paid for.</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Refund requests</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">If you believe you were charged incorrectly, could not access a paid feature, or have another reasonable refund request, email <a className="underline underline-offset-2 hover:text-foreground" href="mailto:mystudyplanner.studio@gmail.com?subject=Premium%20refund%20request">mystudyplanner.studio@gmail.com</a> with the account email and a short description of the issue. Do not send payment card details.</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Australian Consumer Law</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">This policy does not exclude, restrict or modify consumer guarantees, refund rights or other remedies that cannot lawfully be excluded. Where the Australian Consumer Law or another applicable law requires a refund or other remedy, that law applies.</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Change of mind</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">A change of mind does not automatically create a refund entitlement after a subscription period has started, unless required by law. We may still consider reasonable requests individually.</p>
        </section>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal pages">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Use</Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link>
        </nav>
      </div>
    </main>
  );
}
