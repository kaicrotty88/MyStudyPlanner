import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  BarChart3,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const featurePills = [
  "Timetable",
  "Classes",
  "Assignments",
  "Exams",
  "Study sessions",
  "Marks",
] as const;

const features: Feature[] = [
  {
    icon: CalendarDays,
    title: "A calendar that starts with your timetable",
    description:
      "Recurring classes sit beside assignments, exams, reminders, and study sessions, so your week finally looks like your real school life.",
  },
  {
    icon: CheckCircle2,
    title: "Deadlines that stay visible",
    description:
      "Homework, assessments, and exams are organised by subject and date, so important work does not disappear into notes, screenshots, or random apps.",
  },
  {
    icon: BarChart3,
    title: "Marks and study progress in one place",
    description:
      "Track results, log study sessions, and see where your time is going before it is already too late to fix the subject falling behind.",
  },
];

const seoLinks = [
  {
    href: "/study-planner-for-university-students",
    label: "Study planner for university students",
  },
  {
    href: "/study-planner-for-high-school-students",
    label: "Study planner for high school students",
  },
  {
    href: "/assignment-tracker-for-students",
    label: "Assignment tracker for students",
  },
  {
    href: "/assignment-planner-for-university-students",
    label: "Assignment planner for university students",
  },
  {
    href: "/homework-planner-for-students",
    label: "Homework planner for students",
  },
  {
    href: "/exam-planner",
    label: "Exam planner",
  },
  {
    href: "/student-planner-app",
    label: "Student planner app",
  },
  {
    href: "/free-study-planner",
    label: "Free study planner",
  },
  {
    href: "/online-study-planner",
    label: "Online study planner",
  },
  {
    href: "/marks-tracker-for-students",
    label: "Marks tracker for students",
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
      url: "https://mystudyplanner.co/sign-up",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "2.99",
      priceCurrency: "USD",
      url: "https://mystudyplanner.co/sign-up",
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
    url: "https://mystudyplanner.co",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "MyStudyPlanner";
  const description =
    "A calm study planner for students. Track assignments, exams, homework, study sessions, marks, and reminders in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
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
      title,
      description,
      url: "/",
      siteName: "MyStudyPlanner",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
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
        <section className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-20 text-center md:px-10 md:pb-20 md:pt-28">
            <p className="mx-auto max-w-2xl text-sm font-medium text-[#5E7A63] md:text-base">
              Stop letting school live across five different apps.
            </p>

            <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95] lg:text-8xl">
              A study planner for students who are tired of missing deadlines.
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-xl md:leading-9">
              MyStudyPlanner brings your timetable, classes, assignments,
              exams, study sessions, marks, and reminders into one calm
              calendar made for high school and university students.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl border border-border bg-background px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free account available. Premium from{" "}
              <span className="font-medium text-foreground">US$2.99/month</span>.
            </p>

            <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {featurePills.map((feature, index) => (
                <span key={feature} className="inline-flex items-center gap-3">
                  <span>{feature}</span>
                  {index < featurePills.length - 1 ? (
                    <span className="text-border">/</span>
                  ) : null}
                </span>
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-6xl md:mt-20">
              <Image
                src="/images/calendar-preview.png"
                alt="MyStudyPlanner calendar showing classes, assignments, exams, and study sessions in one time-grid view"
                width={1800}
                height={1125}
                priority
                className="h-auto w-full rounded-[2rem] border border-border shadow-2xl"
              />
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                A real time-grid calendar for recurring classes, deadlines,
                study sessions, reminders, and everything else students need to
                remember.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                Why it exists
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                School planning gets messy fast.
              </h2>
            </div>

            <div className="space-y-8 text-xl leading-9 text-muted-foreground md:text-2xl md:leading-10">
              <p>
                Your timetable is in one place. Assignments are somewhere else.
                Exam dates live in your notes. Study sessions get planned in
                your head, then forgotten when the week gets busy.
              </p>
              <p className="text-foreground">
                MyStudyPlanner puts the whole student workload onto one calendar
                so every class, deadline, exam, study block, mark, and reminder
                has somewhere obvious to live.
              </p>
            </div>
          </div>
        </section>

        <section id="features-section" className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                Features
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Everything important, without turning planning into another job.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                A simple student planner app and online study planner for high
                school and university students who want the essentials done
                well.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="max-w-md">
                    <div className="inline-flex rounded-2xl bg-[#E6F0DD] p-3 text-[#517535]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Free to start. Premium when you need more.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                Start with the core planner for free. Upgrade later for marks,
                insights, and future advanced features.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm md:p-10">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Free
                </div>
                <div className="mt-5 text-5xl font-semibold text-foreground">
                  $0
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Forever free
                </p>

                <ul className="mt-8 space-y-4 text-sm text-foreground">
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                    Timetable and classes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                    Assignments & homework
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                    Exam dates & study sessions
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                    Reminders
                  </li>
                </ul>

                <Link
                  href="/sign-up"
                  className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted/60"
                >
                  Get started free
                </Link>
              </div>

              <div className="rounded-[2rem] border border-[#7A9B7F] bg-[#F8FBF8] p-8 shadow-sm md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5E7A63]">
                    Premium
                  </div>
                  <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                    Recommended
                  </span>
                </div>

                <div className="mt-5 text-5xl font-semibold text-foreground">
                  US$2.99
                </div>
                <p className="mt-2 text-sm text-muted-foreground">per month</p>

                <ul className="mt-8 space-y-4 text-sm text-foreground">
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                    Marks tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                    Insights & stronger visibility
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                    Advanced features as released
                  </li>
                </ul>

                <Link
                  href="/sign-up"
                  className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Start with Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  What is the best study planner for students?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  The best study planner for students is one that keeps
                  assignments, homework, exams, study sessions, and reminders in
                  one place without feeling cluttered. MyStudyPlanner is built
                  for students who want a calm, simple planner that is easy to
                  keep using.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Is MyStudyPlanner good for high school and university
                  students?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. MyStudyPlanner works for both high school and university
                  students who want one place to organise deadlines, homework,
                  study sessions, exams, and marks without using multiple tools.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Can I use MyStudyPlanner as a free online study planner?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. You can start with a free account and use MyStudyPlanner
                  online to organise subjects, assignments, exams, homework, and
                  study sessions before deciding whether premium features are
                  right for you.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Does MyStudyPlanner track assignments, exams, and marks?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. MyStudyPlanner helps students track assignments, exam
                  dates, homework, study sessions, and reminders in one place.
                  Marks tracking and insights are available as premium features.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[#E8F0DD]">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:px-10 md:py-24">
            <Clock3 className="h-8 w-8 text-[#517535]" />
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Plan your school week in one calendar.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Try the demo first or create your account and start planning
              properly.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-background/70"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-background/70"
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

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition hover:bg-background"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-4 w-4" />© {new Date().getFullYear()} MyStudyPlanner
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