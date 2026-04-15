import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Homework Planner for Students | MyStudyPlanner",
  description:
    "Use MyStudyPlanner as a homework planner for students to organise homework, assignments, study sessions, and due dates in one place.",
  alternates: { canonical: "/homework-planner-for-students" },
  openGraph: {
    title: "Homework Planner for Students | MyStudyPlanner",
    description:
      "Organise homework, assignments, study sessions, and due dates in one calm student planner.",
    url: "/homework-planner-for-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Homework Planner for Students | MyStudyPlanner",
    description:
      "A homework planner for students to keep homework, assignments, and study sessions organised.",
  },
};

const benefits = [
  {
    title: "Keep homework visible",
    description: "See homework and smaller weekly tasks in one place instead of relying on memory.",
  },
  {
    title: "Plan around due dates",
    description: "Keep homework connected to subjects, assignments, and upcoming deadlines.",
  },
  {
    title: "Stay consistent",
    description: "Use study sessions to keep up with work throughout the week instead of cramming.",
  },
  {
    title: "Reduce stress",
    description: "A clearer homework planning setup makes busy school weeks feel more manageable.",
  },
];

export default function HomeworkPlannerForStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For homework and weekly work</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Homework planner for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps students organise homework, assignments, study sessions, and due dates in one place so
          daily school work feels easier to stay on top of.
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
        <h2 className="text-lg font-semibold text-foreground">Why a homework planner helps</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Homework is easy to underestimate because it is often made up of smaller tasks spread across different
            subjects.
          </p>
          <p>
            A homework planner helps you keep those tasks visible, connect them to the right subject, and stay ahead of
            work before it builds up.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">How MyStudyPlanner fits</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Add your subjects, enter homework and assignments, and keep due dates visible throughout the week.
          </p>
          <p>
            Then use study sessions to plan when you will actually do the work instead of just listing it.
          </p>
          <p>
            MyStudyPlanner is built for real student life, so homework, bigger assignments, exams, and marks can all
            stay together in one workflow.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/assignment-tracker-for-students" className="text-muted-foreground transition hover:text-foreground">
          Assignment tracker for students
        </Link>
        <Link href="/exam-planner" className="text-muted-foreground transition hover:text-foreground">
          Exam planner
        </Link>
        <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
          How it works
        </Link>
      </div>
    </main>
  );
}