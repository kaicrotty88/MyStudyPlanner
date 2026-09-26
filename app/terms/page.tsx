import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using MyStudyPlanner, including accounts, acceptable use, Premium subscriptions, payments, cancellations and availability of the service.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use | MyStudyPlanner",
    description: "Terms for using MyStudyPlanner, including accounts, acceptable use, Premium subscriptions, payments, cancellations and availability of the service.",
    url: "/terms",
    siteName: "MyStudyPlanner",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MyStudyPlanner study planner for students" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use | MyStudyPlanner",
    description: "Terms for using MyStudyPlanner, including accounts, acceptable use, Premium subscriptions, payments, cancellations and availability of the service.",
    images: ["/twitter-image"],
  },
};

const updated = "23 September 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="inline-flex text-sm text-muted-foreground transition hover:text-foreground">← Back to home</Link>
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Terms of Use</h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">These terms set the rules for using MyStudyPlanner.</p>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </header>

      <div className="mt-10 space-y-6">
        {[
          ["Using MyStudyPlanner", "MyStudyPlanner is a student planning tool for organising assessments, tasks, timetables, study sessions and results. It is a support tool only. You remain responsible for checking official school, university and course information, including deadlines and exam details."],
          ["Accounts and eligibility", "You must provide accurate account information and keep your account secure. Do not access another person's account without permission. If the law where you live requires parent or guardian involvement before you can agree to these terms, use the service only with that involvement."],
          ["Acceptable use", "Do not misuse the service, attempt unauthorised access, interfere with security or availability, upload unlawful material, abuse other users, scrape the service in a harmful way, or use MyStudyPlanner to infringe another person's rights."],
          ["Your content", "You keep ownership of information you enter into MyStudyPlanner. You give us the limited permission needed to host, process, back up and display that information so we can provide the service to you."],
          ["Our intellectual property", "MyStudyPlanner's software, branding, interface, original text and other service materials remain owned by their respective rights holders. These terms do not transfer ownership of MyStudyPlanner to you."],
          ["Availability and changes", "We may improve, change, suspend or remove features as the service develops. We aim to provide a reliable service but cannot promise uninterrupted or error-free operation. Where practical, we will avoid changes that unfairly remove paid value during an active billing period."],
        ].map(([title, body]) => (
          <section key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{body}</p>
          </section>
        ))}

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Premium subscriptions</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>Premium is offered at the price shown before checkout. Current standard pricing is USD $2.99 per month or USD $19.99 per year. Your selected subscription renews automatically at the applicable billing interval until cancelled.</p>
            <p>Stripe processes checkout and subscription management. You can manage or cancel a subscription from the billing controls available in Settings. Cancelling stops future renewal and normally leaves Premium active until the end of the paid billing period.</p>
            <p>Promotions, currencies or prices may change for future purchases or renewal periods where permitted. We will not intentionally hide a mandatory fee or describe a longer commitment as though it were a shorter one.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Refunds and consumer rights</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Refund requests are handled under our <Link className="underline underline-offset-2 hover:text-foreground" href="/refund">Refund Policy</Link>. Nothing in these terms excludes, restricts or modifies rights or remedies that cannot lawfully be excluded, including applicable rights under the Australian Consumer Law.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Ending use or closing an account</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            You may stop using MyStudyPlanner at any time. You can clear planner data in Settings and request account deletion by contacting <a className="underline underline-offset-2 hover:text-foreground" href="mailto:mystudyplanner.studio@gmail.com?subject=Account%20deletion%20request">mystudyplanner.studio@gmail.com</a>. We may suspend or terminate access where reasonably necessary to protect the service, comply with law or address serious misuse.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Liability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            To the extent permitted by law, MyStudyPlanner is not responsible for indirect or consequential loss arising from reliance on planner entries, missed deadlines, academic outcomes, service interruptions or information you entered incorrectly. This limitation does not apply where liability cannot lawfully be excluded or limited.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Governing law and contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            These terms are intended to operate under the laws applicable in New South Wales, Australia, subject to any mandatory laws that apply to you elsewhere. Questions can be sent to <a className="underline underline-offset-2 hover:text-foreground" href="mailto:mystudyplanner.studio@gmail.com">mystudyplanner.studio@gmail.com</a>.
          </p>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal pages">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link>
        </nav>
      </div>
    </main>
  );
}
