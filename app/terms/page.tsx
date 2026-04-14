import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Terms of Use | MyStudyPlanner",
  description:
    "Read the MyStudyPlanner Terms of Use covering account responsibility, availability, subscriptions, and limitations of liability.",
  alternates: { canonical: "/terms" },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Use | MyStudyPlanner",
    description:
      "Terms covering account responsibility, subscriptions, availability, and limitations of liability.",
    url: "/terms",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use | MyStudyPlanner",
    description:
      "Terms covering account responsibility, subscriptions, availability, and limitations of liability.",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">Legal</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Terms of Use
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          These terms explain the basic rules for using MyStudyPlanner and what you can expect from the app.
        </p>

        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-base leading-relaxed text-foreground">
            By using MyStudyPlanner, you agree to these terms. They are intended to keep the app fair, safe, and usable
            for everyone.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Purpose of the app</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            MyStudyPlanner is a student planning tool designed to help students organise assignments, homework, exams,
            study sessions, and marks. It does not provide academic advice and does not guarantee academic results.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">User responsibility</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            You are responsible for how you use the app and for the accuracy of the information you enter.
            MyStudyPlanner should be treated as a support tool, not as a replacement for official school, university, or
            course requirements.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            You are responsible for maintaining the security of your account and for keeping your login details private.
            You must not use another person’s account without permission.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Premium subscriptions</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Some features may require a paid subscription. Billing, renewals, cancellations, and payment processing are
            handled through Stripe. Subscription pricing and included features may change over time.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Availability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            We aim to keep the app available and reliable, but uninterrupted access cannot be guaranteed. Features may
            be changed, improved, removed, or temporarily unavailable as MyStudyPlanner develops.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            You agree not to misuse the app, interfere with its operation, attempt unauthorised access, or use
            MyStudyPlanner in a way that harms other users or the service itself.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Limitation of liability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            MyStudyPlanner is provided “as is”. To the fullest extent permitted by law, we are not responsible for loss
            of data, missed deadlines, academic outcomes, or other losses resulting from use of the app.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Changes to these terms</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            These terms may be updated from time to time. Continued use of the app after updates means you accept the
            revised terms.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/privacy" className="text-muted-foreground transition hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/about" className="text-muted-foreground transition hover:text-foreground">
            About
          </Link>
          <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
            How it works
          </Link>
        </div>
      </div>
    </main>
  );
}