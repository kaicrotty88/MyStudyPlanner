import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Privacy Policy | MyStudyPlanner",
  description:
    "Read the MyStudyPlanner Privacy Policy to understand how account data, study data, cookies, and authentication are handled.",
  alternates: { canonical: "/privacy" },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | MyStudyPlanner",
    description:
      "How MyStudyPlanner handles account data, study data, cookies, and authentication.",
    url: "/privacy",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | MyStudyPlanner",
    description:
      "How MyStudyPlanner handles account data, study data, cookies, and authentication.",
  },
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          This page explains what information MyStudyPlanner collects, how it is used, and how basic account and study
          data is handled.
        </p>

        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-base leading-relaxed text-foreground">
            MyStudyPlanner is built by students, for students. We try to collect as little personal information as
            possible while still making the app work properly.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">What information we collect</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            When you create an account, basic account details such as your email address and name may be collected for
            authentication and account access. If you use the planner, the study information you choose to enter may
            also be stored, such as subjects, tasks, assessments, study sessions, and marks.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">How your data is used</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Your data is used to operate MyStudyPlanner, including signing you in, saving your planner data, supporting
            subscriptions, and keeping the app secure. We do not sell your personal data and we do not use it for
            third-party advertising.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Authentication and security</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            MyStudyPlanner uses Clerk for authentication and account security. Clerk may use strictly necessary cookies
            or similar technologies to keep you signed in, protect sessions, and reduce unauthorised access.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Premium subscriptions and billing are handled through Stripe. MyStudyPlanner does not store full card
            details on its own servers. Stripe may process billing information according to its own privacy and security
            practices.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            We only use cookies and similar technologies that are needed for the app to function properly, including
            login, session security, and basic site functionality. These are not intended to track you across unrelated
            websites.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Data storage</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Planner data is stored so the app can work across sessions and devices for signed-in users. Demo mode data
            may be stored locally in your browser and can usually be cleared from your device at any time.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Changes to this policy</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            This policy may be updated from time to time as MyStudyPlanner changes. Material updates will be reflected
            on this page.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            If you have questions about privacy or data usage, contact{" "}
            <a href="mailto:mystudyplanner.studio@gmail.com" className="underline transition hover:text-foreground">
              mystudyplanner.studio@gmail.com
            </a>
            .
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/terms" className="text-muted-foreground transition hover:text-foreground">
            Terms of Use
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