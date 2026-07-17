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
  Layers3,
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
      "Track results, log study sessions, and see which subjects are receiving your time so you can adjust earlier instead of guessing.",
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
  const title = "MyStudyPlanner | Timetable, Assignments and Study Planner";
  const description =
    "Plan your timetable, classes, assignments, exams, study sessions, marks, and reminders in one calm calendar built for students.";

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
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 text-center md:px-10 md:pb-20 md:pt-24">
            <p className="mx-auto max-w-2xl text-sm font-medium text-[#5E7A63] md:text-base">
              Stop letting school live across five different apps.
            </p>

            <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.98] lg:text-8xl">
              Your timetable, deadlines and study plan in one calendar.
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-xl md:leading-9">
              Plan recurring classes, assignments, exams, study sessions, marks,
              and reminders in one calm workspace built for high school and
              university students.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Create free account
              </Link>

              <Link
                href="/demo"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl border border-border bg-background px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Try the live demo
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free to start. Premium from{" "}
              <span className="font-medium text-foreground">
                US$19.99 per year
              </span>
              .
            </p>

            <div className="mx-auto mt-10 max-w-6xl md:mt-14">
              <Image
                src="/images/calendar-preview.png"
                alt="MyStudyPlanner calendar showing classes, assignments, exams, and study sessions in one time-grid view"
                width={1800}
                height={1125}
                priority
                className="h-auto w-full rounded-[2rem] border border-border shadow-2xl"
              />
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                A real time-grid calendar where recurring classes, deadlines,
                study sessions, reminders, and assessments stay visible
                together.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                Why it exists
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                School planning gets messy fast.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
                MyStudyPlanner gives every class, deadline, study block, mark,
                and reminder one obvious place to live.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-border bg-muted/20 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Before
                </div>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
                  <li>Timetable in one app</li>
                  <li>Assignments in notes or screenshots</li>
                  <li>Exam dates hidden in messages</li>
                  <li>Study plans kept in your head</li>
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-[#9DB49F] bg-[#F4F8F4] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5E7A63]">
                  With MyStudyPlanner
                </div>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground">
                  <li>Everything visible in one weekly calendar</li>
                  <li>Deadlines attached to the right subject</li>
                  <li>Study sessions actually scheduled</li>
                  <li>Marks and progress kept connected</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="features-section" className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                Features
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Everything important, without turning planning into another job.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                The tools students actually need, kept simple enough to use
                every day.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-3">
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
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                How it works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Set it up once, then plan your week properly.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Set up your subjects and timetable",
                  body: "Add your subjects, term dates, periods, and recurring classes so the calendar reflects your real week.",
                },
                {
                  number: "02",
                  title: "Add deadlines and study sessions",
                  body: "Plan assignments, exams, homework, personal tasks, and focused study blocks in the same workspace.",
                },
                {
                  number: "03",
                  title: "See what needs attention",
                  body: "Review your week, track completed work, record marks, and adjust before a subject starts falling behind.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-[1.75rem] border border-border bg-card p-7 shadow-sm"
                >
                  <div className="text-sm font-semibold text-[#5E7A63]">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Free to start. Premium when you need more.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                Use the core planner for free. Upgrade for marks, insights, and
                deeper progress tracking.
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
                  {[
                    "Timetable and recurring classes",
                    "Assignments, homework, and exams",
                    "Study sessions and reminders",
                    "Account sync and backups",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                      {item}
                    </li>
                  ))}
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
                    Best value
                  </span>
                </div>

                <div className="mt-5 text-5xl font-semibold text-foreground">
                  US$19.99
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  per year, about US$1.67/month
                </p>
                <p className="mt-3 text-sm font-medium text-[#5E7A63]">
                  Save US$15.89, around 44%
                </p>

                <ul className="mt-8 space-y-4 text-sm text-foreground">
                  {[
                    "Everything in Free",
                    "Marks tracking",
                    "Study insights",
                    "Performance summaries",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Start with Premium
                </Link>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Monthly billing is also available at US$2.99.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-[#E8F0DD] text-[#517535]">
                <Layers3 className="h-9 w-9" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">
                Built by a student
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Made because the usual student planning setup was not good
                enough.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                MyStudyPlanner was built to replace the mix of calendars,
                screenshots, notes, reminders, and half-finished to-do lists
                students rely on. The goal is simple: make the whole school week
                visible without making the planner itself complicated.
              </p>
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

            <div className="mt-10 divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border bg-card">
              {[
                {
                  question: "Is MyStudyPlanner free?",
                  answer:
                    "Yes. The Free plan includes the core calendar, subjects, term dates, timetable, assignments, homework, exams, study sessions, reminders, account sync, and backup tools.",
                },
                {
                  question: "Can I add my school or university timetable?",
                  answer:
                    "Yes. You can create recurring weekly or fortnightly classes and place them alongside deadlines and study sessions in the same calendar.",
                },
                {
                  question: "Does MyStudyPlanner work for both high school and university?",
                  answer:
                    "Yes. School students can use fixed periods and Week A or Week B cycles, while university students can add lectures, tutorials, labs, work, and other recurring commitments.",
                },
                {
                  question: "Can I track assignments, exams, and marks?",
                  answer:
                    "Yes. Assignments, exams, homework, and study sessions can all be planned in the core app. Marks tracking and deeper study insights are Premium features.",
                },
                {
                  question: "Does my planner sync across devices?",
                  answer:
                    "Yes. Signed-in accounts save planner data to your account so you can access the same setup and schedule across supported devices.",
                },
              ].map((item) => (
                <div key={item.question} className="p-6 md:p-7">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[#E8F0DD]">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:px-10 md:py-24">
            <Clock3 className="h-8 w-8 text-[#517535]" />
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              See your whole school week in one calendar.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Start free, add your timetable, and stop relying on five different
              places to remember what is coming up.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Create free account
              </Link>

              <Link
                href="/demo"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-background/70"
              >
                Try the live demo
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Explore student planning guides
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Helpful pages for different study needs and student workflows.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seoLinks.slice(0, 6).map((link) => (
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
              <Link href="/about" className="text-muted-foreground transition hover:text-foreground">
                About
              </Link>
              <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
                How it works
              </Link>
              <Link href="/privacy" className="text-muted-foreground transition hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground transition hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}