import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomepagePreviewCarousel from "@/components/HomepagePreviewCarousel";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "The study planner built for real student life",
  description:
    "Track deadlines, log study sessions, and see your marks improve — all in one place designed around how students actually work.",
  keywords: [
    "student planner",
    "study planner",
    "online study planner",
    "assignment tracker",
    "exam planner",
    "homework planner",
    "marks tracker",
    "study log",
    "student planner app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "The study planner built for real student life",
    description:
      "Track deadlines, log study sessions, and see your marks improve — all in one place designed around how students actually work.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The study planner built for real student life",
    description:
      "Track deadlines, log study sessions, and see your marks improve — all in one place designed around how students actually work.",
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
      "See all your assignments, exams, and study sessions colour-coded by subject at a glance.",
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
      "Log sessions fast and link them to the assignment you're working on. See your consistency over time.",
  },
  {
    icon: "📊",
    title: "Marks tracking",
    description:
      "Record results across all subjects and see which areas need the most attention.",
    premium: true,
  },
  {
    icon: "↗",
    title: "Insights",
    description:
      "Track study streaks, daily averages, and your strongest subjects without leaving the app.",
    premium: true,
  },
  {
    icon: "🔔",
    title: "Reminders",
    description:
      "Quick notes for life stuff — not assignments. Pack bag tonight. Email teacher. Buy new pens.",
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

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
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

            <p className="mx-auto mt-4 max-w-[48rem] text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
              Track deadlines, log study sessions, and see your marks improve — all in one place designed around how
              students actually work.
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
              Free account available. Premium from <span className="font-medium text-foreground">US$2.99/month</span>.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-sm text-muted-foreground">Preview the planner</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Click through the core experience
              </h2>
            </div>

            <HomepagePreviewCarousel />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Everything students actually need.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                No productivity jargon. No complicated systems. Just the essentials, done well.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    {feature.premium ? (
                      <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                        Premium
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Marks tracking and Insights are Premium features.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                What students are saying
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-sm leading-7 text-foreground">“{testimonial.quote}”</p>
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-14 text-center md:px-10 md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Free to start. Useful from day one.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Add your subjects, enter your next few deadlines, and you&apos;re set. No setup required.
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

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyStudyPlanner</div>

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