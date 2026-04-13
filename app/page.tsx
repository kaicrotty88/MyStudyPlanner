// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Stay organised as a student",
  description:
    "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  keywords: [
    "student planner",
    "study planner",
    "assessment tracker",
    "assignment planner",
    "homework planner",
    "study session tracker",
    "marks tracker",
    "school planner",
    "student organisation app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  },
};

const coreFeatures = [
  "Assessments",
  "Assignments",
  "Homework",
  "Study sessions",
  "Marks",
  "Insights",
];

const freeFeatures = [
  "Organise assessments, assignments, and homework",
  "Plan study sessions in one place",
  "Manage subjects and your weekly workload",
  "Save your planner with a free account",
];

const premiumFeatures = [
  "Track marks across the year",
  "See insights and progress trends",
  "Unlock future advanced analytics",
  "Unlock future dashboard customisation",
];

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  badge?: string;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Start with the core planner features and save your account.",
    features: freeFeatures,
    cta: "Create free account",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Premium Monthly",
    price: "US$2.99",
    period: "/month",
    description: "Flexible access for students who want Premium now.",
    features: premiumFeatures,
    cta: "Create account to upgrade",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Premium Yearly",
    price: "US$19.99",
    period: "/year",
    description: "Best value for students planning across the full year.",
    features: premiumFeatures,
    cta: "Create account to upgrade",
    href: "/sign-up",
    highlighted: true,
    badge: "Best value",
  },
];

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </div>

          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-16 md:h-72 md:w-72" />
          </div>

          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-16 text-center md:px-10 md:py-24">
            <h1 className="mx-auto max-w-[13ch] text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95]">
              Everything you need to stay organised as a student.
            </h1>

            <p className="mx-auto mt-4 max-w-[42rem] text-[15px] leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
              Organise assessments, assignments, homework, study sessions, and marks in one planner built for real
              student life.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {coreFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>

            <div className="mt-5 max-w-2xl rounded-2xl border border-border bg-card/80 px-4 py-4 text-sm text-muted-foreground shadow-sm">
              Create a free account to save your planner and stay organised across assessments, assignments, homework,
              and study sessions. Upgrade any time for marks, insights, and more advanced features.
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                What happens when you create an account?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                You can start with a free account to save your planner, manage your subjects, and keep your school work
                organised in one place. Premium adds marks, insights, and future advanced features.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    "flex h-full flex-col rounded-3xl border p-6 shadow-sm",
                    plan.highlighted ? "border-[#7A9B7F] bg-[#F8FBF8]" : "border-border bg-card",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                        {plan.badge ? (
                          <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-semibold text-foreground">{plan.price}</div>
                      {plan.period ? <div className="text-xs text-muted-foreground">{plan.period}</div> : null}
                    </div>
                  </div>

                  <div className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-full bg-[#E8F0E9] p-1 text-[#7A9B7F]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm text-foreground/90">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.href}
                    className={[
                      "mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition",
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:opacity-95"
                        : "border border-border bg-card text-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              You can also try the demo first before creating an account.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Built for real student life
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                MyStudyPlanner keeps the things students actually want to use together: assessments, assignments,
                homework, study sessions, marks, and insights.
              </p>
              <p className="mt-3 text-sm font-medium text-[#7A9B7F]">Built by students, for students.</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-sm font-semibold text-foreground">Keep everything together</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Stop splitting your school work across random notes, calendars, and to-do apps.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-sm font-semibold text-foreground">Stay organised without clutter</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Designed to feel calm, clean, and useful instead of overloaded or generic.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-sm font-semibold text-foreground">Upgrade only when it makes sense</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start free, try the demo, and move to Premium when marks and insights become valuable to you.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Create free account
              </Link>

              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Try demo first
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
        </footer>// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Stay organised as a student",
  description:
    "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  keywords: [
    "student planner",
    "study planner",
    "assessment tracker",
    "assignment planner",
    "homework planner",
    "study session tracker",
    "marks tracker",
    "school planner",
    "student organisation app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  },
};

const coreFeatures = [
  "Assessments",
  "Assignments",
  "Homework",
  "Study sessions",
  "Marks",
  "Insights",
];

const freeFeatures = [
  "Organise assessments, assignments, and homework",
  "Plan study sessions in one place",
  "Manage subjects and your weekly workload",
  "Save your planner with a free account",
];

const premiumFeatures = [
  "Track marks across the year",
  "See insights and progress trends",
  "Unlock future advanced analytics",
  "Unlock future dashboard customisation",
];

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  badge?: string;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Start with the core planner features and save your account.",
    features: freeFeatures,
    cta: "Create free account",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Premium Monthly",
    price: "US$2.99",
    period: "/month",
    description: "Flexible access for students who want Premium now.",
    features: premiumFeatures,
    cta: "Create account to upgrade",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Premium Yearly",
    price: "US$19.99",
    period: "/year",
    description: "Best value for students planning across the full year.",
    features: premiumFeatures,
    cta: "Create account to upgrade",
    href: "/sign-up",
    highlighted: true,
    badge: "Best value",
  },
];

const trustPoints = [
  {
    title: "Built for students",
    description: "Designed around real school and uni workloads, not generic productivity jargon.",
  },
  {
    title: "Start free",
    description: "Create a free account first, then upgrade later only if Premium makes sense for you.",
  },
  {
    title: "Try the demo",
    description: "Explore the planner before signing up if you just want to see how it works.",
  },
];

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </div>

          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-16 md:h-72 md:w-72" />
          </div>

          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-14 text-center md:px-10 md:py-20">
            <h1 className="mx-auto max-w-[13ch] text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95]">
              Everything you need to stay organised as a student.
            </h1>

            <p className="mx-auto mt-4 max-w-[42rem] text-[15px] leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
              Organise assessments, assignments, homework, study sessions, and marks in one planner built for real
              student life.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {coreFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try demo first
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

            <a
              href="#plans"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#5E7A63] transition hover:opacity-80"
            >
              See plans below
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="plans" className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Free to start. Premium when you need more.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Create a free account to save your planner. Upgrade later for marks, insights, and more advanced
                features.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    "flex h-full flex-col rounded-3xl border p-6 shadow-sm",
                    plan.highlighted ? "border-[#7A9B7F] bg-[#F8FBF8]" : "border-border bg-card",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                        {plan.badge ? (
                          <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-semibold text-foreground">{plan.price}</div>
                      {plan.period ? <div className="text-xs text-muted-foreground">{plan.period}</div> : null}
                    </div>
                  </div>

                  <div className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-full bg-[#E8F0E9] p-1 text-[#7A9B7F]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm text-foreground/90">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.href}
                    className={[
                      "mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition",
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:opacity-95"
                        : "border border-border bg-card text-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              You can try the demo before creating an account.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Why students use it
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                A planner that keeps the important parts of student life together without feeling cluttered.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {trustPoints.map((point) => (
                <div key={point.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="text-sm font-semibold text-foreground">{point.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.description}</p>
                </div>
              ))}
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
      </main>
    </div>
  );
}