import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  GraduationCap,
  LineChart,
  ListChecks,
  TimerReset,
} from "lucide-react";

const seoLinks = [
  { href: "/study-planner-for-high-school-students", label: "Study planner for high school students" },
  { href: "/study-planner-for-university-students", label: "Study planner for university students" },
  { href: "/assignment-tracker-for-students", label: "Assignment tracker for students" },
  { href: "/homework-planner-for-students", label: "Homework planner for students" },
  { href: "/exam-planner", label: "Exam planner" },
  { href: "/student-planner-app", label: "Student planner app" },
  { href: "/free-study-planner", label: "Free study planner" },
  { href: "/online-study-planner", label: "Online study planner" },
  { href: "/marks-tracker-for-students", label: "Marks tracker for students" },
] as const;

const faq = [
  {
    question: "Is MyStudyPlanner free?",
    answer:
      "Yes. You can use the core planner, timetable, tasks, calendar and connected study workflow on the Free plan. Premium adds marks and deeper performance insights.",
  },
  {
    question: "Can I use MyStudyPlanner for assignments, homework and exams?",
    answer:
      "Yes. MyStudyPlanner is built for real schoolwork including homework, assignments, exams, reminders and study sessions. Assessments can stay linked to the preparation you do for them.",
  },
  {
    question: "Can I add my school or university timetable?",
    answer:
      "Yes. You can add recurring weekly or fortnightly classes and see them alongside deadlines and study sessions in the same calendar.",
  },
  {
    question: "Does MyStudyPlanner work across devices?",
    answer:
      "Yes. Signed-in accounts save planner data to your account so you can keep the same planner across supported devices.",
  },
] as const;

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyStudyPlanner",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Student Planner",
  operatingSystem: "Web",
  url: "https://mystudyplanner.co",
  description:
    "A student planner for timetables, assignments, homework, exams, study sessions and marks, with connected planning across your school week.",
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
      name: "Premium Yearly",
      price: "19.99",
      priceCurrency: "USD",
      url: "https://mystudyplanner.co/sign-up",
    },
  ],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "MyStudyPlanner | Student Planner for Timetable, Tasks & Study";
  const description =
    "Plan your timetable, assignments, homework, exams and study sessions in one student planner. Keep schoolwork connected from deadline to preparation and results.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    keywords: [
      "student planner",
      "study planner",
      "study planner for students",
      "student planner app",
      "assignment tracker for students",
      "homework planner",
      "exam planner",
      "school timetable planner",
      "online study planner",
      "marks tracker for students",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: "MyStudyPlanner",
      type: "website",
      images: [
        {
          url: "/homepage/calendar-week.png",
          width: 1600,
          height: 900,
          alt: "MyStudyPlanner weekly calendar with timetable classes and school deadlines",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/homepage/calendar-week.png"],
    },
  };
}

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 md:px-10">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
            <a
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground md:inline-flex"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground lg:inline-flex"
            >
              Pricing
            </a>
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-6 md:px-10 md:pb-20 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-medium text-[#55745D]">A planner built around how school actually works</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl md:leading-[1.02] lg:text-[68px]">
                Keep your whole school week in one place.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                MyStudyPlanner brings your timetable, assignments, homework, exams, study sessions and results together so you always know what is coming up and what to work on next.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
                >
                  Try the live demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-semibold shadow-sm transition hover:bg-muted/50 sm:w-auto"
                >
                  Create free account
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
                Free to start · No credit card required · Premium from US$19.99/year
              </p>
            </div>

            <div className="relative mx-auto mt-12 max-w-6xl md:mt-16">
              <div className="absolute inset-x-14 -bottom-7 h-20 rounded-full bg-[#DDE8DA]/50 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_22px_70px_-28px_rgba(0,0,0,0.28)] md:rounded-[1.4rem]">
                <Image
                  src="/homepage/calendar-week.png"
                  alt="MyStudyPlanner weekly student calendar showing classes, homework and assessment deadlines"
                  width={1600}
                  height={900}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
              {[
                "Timetable and classes",
                "Assignments and exams",
                "Study planning",
                "Marks and progress",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#6E9276]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border bg-muted/15">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#55745D]">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Add the work once. Keep the context with it.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                MyStudyPlanner is not just a calendar or a to-do list. Schoolwork can move from deadline, to preparation, to result without being rebuilt in different places.
              </p>
            </div>

            <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
              <ProductStep
                number="01"
                eyebrow="Tasks"
                title="Add assignments, exams and homework without losing the bigger picture."
                body="Keep everyday homework lightweight while assessments carry useful context such as due dates, preparation time and study sessions."
                image="/homepage/tasks-assessments.png"
                imageAlt="MyStudyPlanner tasks page showing assignments, exams and preparation progress"
                icon={<ListChecks className="h-5 w-5" />}
              />

              <ProductStep
                number="02"
                eyebrow="Study"
                title="Open Study and know what deserves your attention next."
                body="Study Focus uses your upcoming work and study history to surface a clear next step. Start a session with the right schoolwork already linked."
                image="/homepage/study-focus.png"
                imageAlt="MyStudyPlanner Study Focus page recommending what a student should study next"
                icon={<TimerReset className="h-5 w-5" />}
                reverse
              />

              <ProductStep
                number="03"
                eyebrow="Progress"
                title="Turn completed assessments into useful performance context."
                body="Premium Marks keeps results, subject performance and assessment preparation together so a score is more than just another number in a spreadsheet."
                image="/homepage/marks-progress.png"
                imageAlt="MyStudyPlanner marks dashboard showing subject performance, results and assessment lifecycle"
                icon={<LineChart className="h-5 w-5" />}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-sm font-medium text-[#55745D]">Made for students</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Not a work app with school features bolted on.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                  Generic task managers treat every item the same. MyStudyPlanner understands classes, homework, assignments, exams, study sessions and results as different parts of the same school week.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: CalendarDays,
                    title: "See the real week",
                    body: "Classes, deadlines and study sessions sit together in one calendar.",
                  },
                  {
                    icon: ListChecks,
                    title: "Separate homework from assessments",
                    body: "Keep small tasks simple while important assessments carry more context.",
                  },
                  {
                    icon: TimerReset,
                    title: "Study with a reason",
                    body: "Start from the work that needs attention instead of logging study into a blank diary.",
                  },
                  {
                    icon: GraduationCap,
                    title: "Review the outcome",
                    body: "Premium connects results and performance back to the work you prepared for.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="border-t border-border pt-5 sm:min-h-[150px]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF1E8] text-[#55745D]">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="mt-4 font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-border bg-muted/15">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-[#55745D]">Simple pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Start free. Upgrade for deeper performance insight.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                You do not need Premium to build a useful planner. Upgrade when you want marks, trends and deeper insight into your results.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
              <PricingCard
                name="Free"
                price="$0"
                detail="Free to use"
                features={[
                  "Timetable and recurring classes",
                  "Homework, assignments and exams",
                  "Calendar and reminders",
                  "Study Focus and study sessions",
                ]}
                cta="Create free account"
                href="/sign-up"
              />
              <PricingCard
                name="Premium"
                price="US$19.99"
                detail="per year · monthly option available"
                features={[
                  "Everything in Free",
                  "Marks and assessment results",
                  "Subject performance summaries",
                  "Deeper study and preparation insights",
                ]}
                cta="Start with Premium"
                href="/sign-up"
                highlighted
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <div>
                <p className="text-sm font-medium text-[#55745D]">Questions</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">About MyStudyPlanner</h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  A few of the things students usually want to know before trying the planner.
                </p>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {faq.map((item) => (
                  <div key={item.question} className="py-6">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[#E7EFE4]">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 md:px-10 md:py-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">See if it fits the way you actually study.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Open the demo first. You can explore the real planner before creating an account.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                Try the live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-7 text-sm font-semibold transition hover:bg-background/75 sm:w-auto"
              >
                Create free account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/15">
          <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6 md:px-10">
            <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Explore student planning tools</p>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2.5">
              {seoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
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

function ProductStep({
  number,
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  icon,
  reverse = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className={reverse ? "lg:order-2" : undefined}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">{number}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF1E8] text-[#55745D]">{icon}</span>
          <span className="text-sm font-medium text-[#55745D]">{eyebrow}</span>
        </div>
        <h3 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">{title}</h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{body}</p>
      </div>
      <div className={reverse ? "lg:order-1" : undefined}>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_-30px_rgba(0,0,0,0.38)]">
          <Image src={image} alt={imageAlt} width={1600} height={900} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  detail,
  features,
  cta,
  href,
  highlighted = false,
}: {
  name: string;
  price: string;
  detail: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-7 ${highlighted ? "border-[#7F9C82] bg-[#F8FBF7]" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        {highlighted ? <span className="rounded-full bg-[#E7EFE4] px-2.5 py-1 text-[11px] font-medium text-[#55745D]">Premium</span> : null}
      </div>
      <div className="mt-5 text-4xl font-semibold tracking-tight">{price}</div>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      <ul className="mt-7 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#66866D]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
          highlighted
            ? "bg-primary text-primary-foreground shadow-sm hover:opacity-95"
            : "border border-border bg-background hover:bg-muted/50"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}