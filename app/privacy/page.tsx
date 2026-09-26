import type { Metadata } from "next";
import Link from "next/link";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyStudyPlanner collects, uses, stores and protects personal information, including account data, analytics, subscriptions and connected calendar data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | MyStudyPlanner",
    description: "How MyStudyPlanner collects, uses, stores and protects personal information, including account data, analytics, subscriptions and connected calendar data.",
    url: "/privacy",
    siteName: "MyStudyPlanner",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MyStudyPlanner study planner for students" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | MyStudyPlanner",
    description: "How MyStudyPlanner collects, uses, stores and protects personal information, including account data, analytics, subscriptions and connected calendar data.",
    images: ["/twitter-image"],
  },
};

const updated = "23 September 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="inline-flex text-sm text-muted-foreground transition hover:text-foreground">← Back to home</Link>
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Privacy Policy</h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          This policy explains what information MyStudyPlanner handles, why it is used, and the choices available to you.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Information we handle</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>When you create an account, authentication details such as your email address and account identifier are handled through Clerk.</p>
            <p>Planner information you choose to enter may include subjects, tasks, assessments, timetable information, study sessions, marks, notes and settings. Signed-in planner data is stored using Supabase so it can remain available across sessions and supported devices.</p>
            <p>We aim to collect only information needed to operate, secure, improve and support the service. Please avoid entering unnecessary sensitive personal information into free-text fields.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Google Calendar</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            If you choose to connect Google Calendar, MyStudyPlanner requests calendar read access so you can import events. Imported information may include event titles, dates, times, descriptions, locations and calendar identifiers. OAuth tokens and selected calendar identifiers are stored so the connection can continue working. Disconnecting Google Calendar removes the stored integration connection and stops future imports.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Premium checkout and subscription management are provided by Stripe. We may send Stripe your account identifier, selected billing interval and account email so checkout and subscription status can be associated with your MyStudyPlanner account. MyStudyPlanner does not store your full payment card details.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Analytics and cookies</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>Necessary browser storage and cookies may be used for sign-in, security and core app functionality.</p>
            <p>Optional analytics are disabled unless you accept analytics. If accepted, Google Analytics, Vercel Analytics and MyStudyPlanner first-party product analytics may collect information about pages or features used, device/browser information and limited event metadata. We do not use advertising cookies.</p>
            <p>You can change this choice at any time.</p>
          </div>
          <CookiePreferencesButton className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted" />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Service providers and overseas processing</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            MyStudyPlanner relies on service providers including Clerk, Supabase, Vercel, Stripe and, when you choose to connect them, Google services. These providers may process information in countries outside Australia. Their own privacy and security terms also apply to information they process on our behalf.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Children and young people</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            MyStudyPlanner is designed for students, including secondary-school students. We try to use clear language, limit collection to what the product needs, and avoid behavioural advertising. If local law requires parent or guardian involvement for your use of an online service, please use MyStudyPlanner with that involvement. We do not ask users to upload identity documents merely to prove age.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Retention, access and deletion</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>We keep account and planner information while it is needed to provide the service, meet legal obligations, resolve disputes or protect the service. Data may also remain for a limited period in secure backups.</p>
            <p>You can clear planner data from Settings. Disconnecting Google Calendar removes the saved calendar connection. For an account deletion, access, correction or privacy request, email <a className="underline underline-offset-2 hover:text-foreground" href="mailto:mystudyplanner.studio@gmail.com?subject=Privacy%20or%20data%20request">mystudyplanner.studio@gmail.com</a>. We may need to verify that the request relates to your account before acting on it.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            We use access controls, authentication and service-provider security features intended to protect stored information. No internet service can guarantee absolute security, so please use a strong login method and do not share access to your account.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Contact and complaints</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            For privacy questions, access or correction requests, deletion requests or complaints, contact <a href="mailto:mystudyplanner.studio@gmail.com" className="underline underline-offset-2 hover:text-foreground">mystudyplanner.studio@gmail.com</a>. We will review privacy complaints in good faith and respond as reasonably practicable.
          </p>
        </section>

        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal pages">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Use</Link>
          <Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link>
        </nav>
      </div>
    </main>
  );
}
