import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "MyStudyPlanner | Study Planner for Students, Assignments, Exams & Study Log",
  description:
    "MyStudyPlanner is a calm, simple study planner for students. Track assignments, exams, homework, study sessions, marks, and reminders in one place. Free to start.",
  keywords: [
    "study planner for students",
    "student planner app",
    "study planner",
    "online study planner",
    "assignment tracker for students",
    "exam planner",
    "homework planner",
    "marks tracker for students",
    "study log",
    "planner for university students",
    "planner for high school students",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MyStudyPlanner | Study Planner for Students, Assignments, Exams & Study Log",
    description:
      "A calm, simple study planner for students. Track assignments, exams, homework, study sessions, marks, and reminders in one place.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyStudyPlanner | Study Planner for Students, Assignments, Exams & Study Log",
    description:
      "A calm, simple study planner for students. Track assignments, exams, homework, study sessions, marks, and reminders in one place.",
  },
};

type Feature = {
  icon: string;
  title: string;
  description: string;
  premium?: boolean;
};

type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};

const featurePills = [
  "Assessments",
  "Assignments",
  "Homework",
  "Study sessions",
  "Marks",
  "Insights",
] as const;

const features: Feature[] = [
  {
    icon: "📅",
    title: "Calendar view",
    description:
      "See assignments, exams, and study sessions colour-coded by subject at a glance.",
  },
  {
    icon: "✓",
    title: "Tasks & deadlines",
    description:
      "Assignments, homework, and exams grouped together so nothing gets buried or forgotten.",
  },
  {
    icon: "⏱",
    title: "Study log",
    description:
      "Log sessions fast and link them to the assignment you're working on.",
  },
  {
    icon: "📊",
    title: "Marks tracking",
    description:
      "Record results across all subjects and see where you need the most attention.",
    premium: true,
  },
  {
    icon: "↗",
    title: "Insights",
    description:
      "Track streaks, daily averages, and your strongest subjects without leaving the app.",
    premium: true,
  },
  {
    icon: "🔔",
    title: "Reminders",
    description:
      "Quick notes for life stuff, not assignments. Pack your bag, email a teacher, buy new pens.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "Finally a planner that doesn't make me feel like I need a productivity degree to use it. I actually open it every day.",
    name: "Aisha R.",
    detail: "Year 12, Sydney",
  },
  {
    quote:
      "The study log linking back to assignments is so useful. I can see exactly how much time I've put into each subject.",
    name: "James T.",
    detail: "First year uni, Melbourne",
  },
  {
    quote:
      "I tried Notion, I tried Google Calendar. This is the first thing that actually stuck because it's built around school, not work.",
    name: "Priya K.",
    detail: "Year 11, Brisbane",
  },
];

const seoLinks = [
  {
    href: "/study-planner-for-university-students",
    label: "Study planner for university students",
  },
  {
    href: "/assignment-tracker-for-students",
    label: "Assignment tracker for students",
  },
  {
    href: "/exam-planner",
    label: "Exam planner",
  },
  {
    href: "/student-planner-app",
    label: "Student planner app",
  },
] as const;

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyStudyPlanner",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Study Planner",
  operatingSystem: "Web",
  url: "https://mystudyplanner.co",
  description:
    "MyStudyPlanner is a web-based study planner for high school and university students. Track assignments, exams, homework, study sessions, marks, and reminders in one calm, simple planner.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "2.99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "2.99",
        priceCurrency: "USD",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
  ],
  creator: {
    "@type": "Organization",
    name: "MyStudyPlanner",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-background">
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />

      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">
              MyStudyPlanner
            </span>
            <span className="text-[11px] text-muted-foreground">
              Built by students, for students
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 sm:inline-flex"
            >
              Create free account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-12 md:h-80 md:w-80" />
          </div>

          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:px-10 md:py-24">
            <div className="inline-flex items-center rounded-full border border-[#D7E4D9] bg-[#F7FAF7] px-3 py-1 text-xs font-medium text-[#5E7A63]">
              Trusted by over 1,000 students
            </div>

            <h1 className="mx-auto mt-5 max-w-[12ch] text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95]">
              The study planner built for real student life.
            </h1>

            <p className="mx-auto mt-4 max-w-[52rem] text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
              MyStudyPlanner is a calm study planner for students who want one
              place to track assignments, exams, homework, study sessions,
              marks, and reminders without using five different tools.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {featurePills.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free account available. Premium from{" "}
              <span className="font-medium text-foreground">US$2.99/month</span>.
            </p>

            <a
              href="#features-section"
              className="mt-7 inline-flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <span>See how it works</span>
              <span
                aria-hidden="true"
                className="inline-block animate-bounce text-sm"
              >
                ↓
              </span>
            </a>
          </div>
        </section>

        <section id="features-section" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Everything students actually need.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                A simple student planner app and online study planner for high
                school and university students who want the essentials done
                well.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    {feature.premium ? (
                      <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                        Premium
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo-section" className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-sm text-muted-foreground">
                Try the real product
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Try the full planner before signing up
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Open the interactive demo and click through the actual
                dashboard, calendar, tasks, study log, insights, marks,
                reminders, and settings.
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    See the real experience, not just screenshots
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                    The demo is the fastest way to understand how
                    MyStudyPlanner feels in use. No account needed.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                      Full product preview
                    </span>
                    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                      Sample data included
                    </span>
                    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                      No account needed
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <Link
                    href="/demo"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 md:w-[220px]"
                  >
                    Try the demo first
                  </Link>
                  <p className="text-center text-xs text-muted-foreground md:w-[220px] md:text-right">
                    Jump straight into the live preview.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Free to start. Premium when you need more.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Start with the core planner for free. Upgrade later for marks,
                insights, and future advanced features.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="text-sm font-semibold text-foreground">
                  Free
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Organise assignments, homework, exams, reminders, and study
                  sessions in one place.
                </p>
              </div>

              <div className="rounded-3xl border border-[#7A9B7F] bg-[#F8FBF8] p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-foreground">
                    Premium
                  </div>
                  <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                    From US$2.99/month
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Unlock marks tracking, insights, and more advanced features as
                  MyStudyPlanner grows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                What students are saying
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <p className="text-sm leading-7 text-foreground">
                    “{testimonial.quote}”
                  </p>
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-14 text-center md:px-10 md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Ready to get organised?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Try the demo first or create your account and start planning
              properly.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Explore more student planning guides
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Helpful pages for different study needs and student workflows.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
              {seoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MyStudyPlanner
            </div>

            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/about"
                className="text-muted-foreground transition hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/how-it-works"
                className="text-muted-foreground transition hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}