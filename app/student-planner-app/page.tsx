import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Student Planner App | MyStudyPlanner",
  description:
    "MyStudyPlanner is a student planner app for organising assignments, homework, exams, study sessions, and marks in one place.",
  alternates: { canonical: "/student-planner-app" },
  openGraph: {
    title: "Student Planner App | MyStudyPlanner",
    description:
      "A student planner app to organise assignments, homework, exams, study sessions, and marks in one place.",
    url: "/student-planner-app",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Planner App | MyStudyPlanner",
    description:
      "A student planner app built for real student life.",
  },
};

const features = [
  "Assignments and homework in one place",
  "Exams and due dates kept visible",
  "Study session planning",
  "Marks tracking and insights",
];

export default function StudentPlannerAppPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground">
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">Student planning</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Student planner app
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a student planner app built to help students organise assignments, homework, exams, study
          sessions, and marks in one place.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Create free account
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Try demo first
          </Link>
        </div>
      </header>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">What a student planner app should do</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            A good student planner app should help students stay organised without feeling overloaded or too generic.
          </p>
          <p>
            MyStudyPlanner is built around the parts of student life people actually need to manage week to week.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Why MyStudyPlanner is different</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Many student tools are either too narrow or too cluttered. MyStudyPlanner is designed to feel calm, useful,
            and student-first.
          </p>
          <p>
            Start with the core planner for free, then upgrade later for marks, insights, and more advanced features.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/online-study-planner" className="text-muted-foreground transition hover:text-foreground">
          Online study planner
        </Link>
        <Link href="/free-study-planner" className="text-muted-foreground transition hover:text-foreground">
          Free study planner
        </Link>
        <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
          How it works
        </Link>
      </div>
    </main>
  );
}