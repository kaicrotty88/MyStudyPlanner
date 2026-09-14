import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
} from "lucide-react";

const seoLinks = [
  { href: "/study-planner-for-university-students", label: "Study planner for university students" },
  { href: "/study-planner-for-high-school-students", label: "Study planner for high school students" },
  { href: "/assignment-tracker-for-students", label: "Assignment tracker for students" },
  { href: "/assignment-planner-for-university-students", label: "Assignment planner for university students" },
  { href: "/homework-planner-for-students", label: "Homework planner for students" },
  { href: "/exam-planner", label: "Exam planner" },
  { href: "/student-planner-app", label: "Student planner app" },
  { href: "/free-study-planner", label: "Free study planner" },
  { href: "/online-study-planner", label: "Online study planner" },
  { href: "/marks-tracker-for-students", label: "Marks tracker for students" },
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
    "MyStudyPlanner connects your timetable, tasks, calendar, study preparation, and results in one calm student planner.",
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
  const title = "MyStudyPlanner | Your School Life, Connected";
  const description =
    "Keep your timetable, schoolwork, calendar, study preparation, and results connected in one student planner built for real student life.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    keywords: [
      "study planner for students",
      "student planner app",
      "assignment tracker for students",
      "exam planner",
      "homework planner",
      "marks tracker for students",
      "study planner",
      "online study planner",
      "school timetable planner",
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

const lifecycle = [
  {
    step: "01",
    title: "Plan",
    body: "Add the assignment, exam, or homework once with its subject and deadline.",
  },
  {
    step: "02",
    title: "Prepare",
    body: "See it in Calendar and Study, then keep every preparation session linked to it.",
  },
  {
    step: "03",
    title: "Perform",
    body: "As the deadline approaches, MyStudyPlanner keeps the work and preparation visible.",
  },
  {
    step: "04",
    title: "Review",
    body: "Record the result and see the outcome beside the preparation that led to it.",
  },
] as const;

export default async function Page() {
  const { userId } = await auth();

  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />

      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground md:inline-flex"
            >
              How it works
            </Link>
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
          <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 text-center md:px-10 md:pb-24 md:pt-24">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#D9E5D6] bg-[#F5F9F3] px-3 py-1.5 text-xs font-medium text-[#517535]">
              <Sparkles className="h-3.5 w-3.5" />
              Calendar → Tasks → Study → Progress
            </div>

            <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.98] lg:text-8xl">
              Your school life, connected.
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-xl md:leading-9">
              Keep your timetable, homework, assessments, study preparation, and results in one system that understands how they relate.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the live demo
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl border border-border bg-background px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free to start. Premium from <span className="font-medium text-foreground">US$19.99 per year</span>.
            </p>

            <div className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-border bg-card p-5 text-left shadow-xl md:mt-16 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E7A63]">
                    One assessment, carried through the whole planner
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Motion topic test
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">Due in 6 days</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 px-5 py-4 md:min-w-[220px]">
                  <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Preparation</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">1h 45m · 2 sessions</div>
                  <div className="mt-1 text-sm text-muted-foreground">Last studied yesterday</div>
                </div>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-4">
                {[
                  ["Tasks", "Added once"],
                  ["Calendar", "Deadline visible"],
                  ["Study", "Preparation linked"],
                  ["Marks", "Result recorded"],
                ].map(([label, detail], index) => (
                  <div key={label} className="relative rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs font-semibold text-[#5E7A63]">0{index + 1}</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{label}</div>
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</div>
                    {index < 3 ? (
                      <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-card p-1 text-muted-foreground md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">One connected workflow</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Plan. Prepare. Perform. Review.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                Assessments are the clearest example of what connected planning means: add one once, then keep the deadline, preparation, study history, and result together.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {lifecycle.map((item) => (
                <div key={item.step} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
                  <div className="text-sm font-semibold text-[#5E7A63]">{item.step}</div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">Built around real student work</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Stop re-entering the same thing in different places.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                Your timetable, deadlines, preparation, study sessions, and results should work together. MyStudyPlanner keeps the context attached as your work moves forward.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: CalendarDays,
                  title: "A calendar built from your real week",
                  body: "Recurring classes, deadlines, exams, and study sessions sit together so you can see what your week actually looks like.",
                },
                {
                  icon: BookOpenCheck,
                  title: "Study that starts from what matters",
                  body: "Study Focus surfaces the schoolwork that needs attention and keeps preparation linked to the exact assessment you are working toward.",
                },
                {
                  icon: BarChart3,
                  title: "Results with the context behind them",
                  body: "Premium Marks connects assessment results with preparation history so performance is easier to understand, not just record.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-border bg-card p-7 shadow-sm">
                    <div className="inline-flex rounded-2xl bg-[#E6F0DD] p-3 text-[#517535]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                    <p className="mt-4 text-base leading-8 text-muted-foreground">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">More than assessments</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                  Your whole week should make sense together.
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                  Classes shape when you are free. Deadlines shape what matters. Study sessions show what you have prepared. MyStudyPlanner keeps those pieces connected instead of making you manage them separately.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: CalendarDays, title: "Timetable + Calendar", body: "Classes, deadlines, and study sessions share the same week instead of living in separate apps." },
                  { icon: CheckCircle2, title: "Tasks + Assessments", body: "Homework and assessments stay organised, with richer progress for the work that matters most." },
                  { icon: Clock3, title: "Study Focus", body: "See what needs attention next and start studying with the right schoolwork already linked." },
                  { icon: BarChart3, title: "Progress + Results", body: "Premium adds marks and performance context so you can understand outcomes, not just store them." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F0DD] text-[#517535]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Free to organise. Premium to understand your performance.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                The core planning and connected study workflow stays useful for free. Premium adds results, trends, and deeper performance insight.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm md:p-10">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Free</div>
                <div className="mt-5 text-5xl font-semibold text-foreground">$0</div>
                <p className="mt-2 text-sm text-muted-foreground">Forever free</p>
                <ul className="mt-8 space-y-4 text-sm text-foreground">
                  {[
                    "Timetable and recurring classes",
                    "Assignments, homework, and exams",
                    "Connected Study Focus and study sessions",
                    "Calendar, reminders, sync, and backups",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8DB174]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted/60">
                  Get started free
                </Link>
              </div>

              <div className="rounded-[2rem] border border-[#7A9B7F] bg-[#F8FBF8] p-8 shadow-sm md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5E7A63]">Premium</div>
                  <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">Best value</span>
                </div>
                <div className="mt-5 text-5xl font-semibold text-foreground">US$19.99</div>
                <p className="mt-2 text-sm text-muted-foreground">per year, about US$1.67/month</p>
                <ul className="mt-8 space-y-4 text-sm text-foreground">
                  {[
                    "Everything in Free",
                    "Assessment marks and results",
                    "Performance summaries and trends",
                    "Deeper study and preparation insights",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#7A9B7F]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-9 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95">
                  Start with Premium
                </Link>
                <p className="mt-4 text-center text-xs text-muted-foreground">Monthly billing is also available at US$2.99.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-[#E8F0DD] text-[#517535]">
                <Layers3 className="h-9 w-9" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#517535]">Built by a student</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
                Built because student life should not need five disconnected tools.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                MyStudyPlanner started from the frustration of keeping timetables, deadlines, study plans, reminders, and results in separate places. The goal is not more productivity features. It is one calmer system where the information already knows how it relates.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="mt-10 divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border bg-card">
              {[
                {
                  question: "Is MyStudyPlanner free?",
                  answer: "Yes. The Free plan includes the core planner, timetable, assignments, homework, exams, connected Study Focus, reminders, sync, and backup tools.",
                },
                {
                  question: "What does connected planning mean?",
                  answer: "When you add schoolwork, the same item can appear across Tasks, Calendar, and Study. Study sessions can stay linked to that assessment, and Premium can carry the result into performance tracking later.",
                },
                {
                  question: "Can I add my school or university timetable?",
                  answer: "Yes. You can create recurring weekly or fortnightly classes and place them beside deadlines and study sessions in the same calendar.",
                },
                {
                  question: "Can I track assignments, exams, and marks?",
                  answer: "Yes. Assignments, exams, homework, and study sessions are part of the core planner. Marks, results, and deeper performance insights are Premium features.",
                },
                {
                  question: "Does my planner sync across devices?",
                  answer: "Yes. Signed-in accounts save planner data to your account so the same setup and schedule are available across supported devices.",
                },
              ].map((item) => (
                <div key={item.question} className="p-6 md:p-7">
                  <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[#E8F0DD]">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:px-10 md:py-24">
            <CheckCircle2 className="h-8 w-8 text-[#517535]" />
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Add it once. Keep it connected.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Start with your subjects and next assessment, then let MyStudyPlanner carry the context through your week.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/demo" className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95">
                Try the live demo
              </Link>
              <Link href="/sign-up" className="inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition hover:bg-background/70">
                Create free account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Explore student planning guides</h2>
              <p className="mt-2 text-sm text-muted-foreground">Helpful pages for different study needs and student workflows.</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3">
              {seoLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}