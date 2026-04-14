import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Study Planner for University Students | MyStudyPlanner",
  description:
    "MyStudyPlanner is a study planner for university students to organise assignments, exams, study sessions, and marks in one place.",
  alternates: { canonical: "/study-planner-for-university-students" },
  openGraph: {
    title: "Study Planner for University Students | MyStudyPlanner",
    description:
      "Organise assignments, exams, study sessions, and marks with a study planner built for university students.",
    url: "/study-planner-for-university-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Planner for University Students | MyStudyPlanner",
    description:
      "A study planner for university students to manage assignments, exams, study sessions, and marks.",
  },
};

const benefits = [
  {
    title: "Keep subjects together",
    description: "Track multiple units or subjects without splitting your workload across separate apps.",
  },
  {
    title: "Stay on top of deadlines",
    description: "See assignments, exams, homework, and due dates in one university planning workflow.",
  },
  {
    title: "Plan study sessions",
    description: "Log study time in a way that stays practical during busy weeks, mid-semester, and exams.",
  },
  {
    title: "Track marks",
    description: "Keep a clearer picture of how your subjects are going over the semester.",
  },
];

export default function UniversityStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For university students</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Study planner for university students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps university students organise assignments, homework, exams, study sessions, and marks in
          one place so it is easier to stay on top of semester workloads.
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
        <h2 className="text-lg font-semibold text-foreground">Why university students use it</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          University work often ends up scattered across lecture notes, calendars, task apps, and reminders.
          MyStudyPlanner gives you one study planner where subjects, assignments, study sessions, and marks can stay
          together.
        </p>

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
        <h2 className="text-lg font-semibold text-foreground">What you can organise</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>Use MyStudyPlanner to keep track of assignment deadlines, homework, exams, study sessions, and marks.</p>
          <p>
            It works well for students who want a calmer planning setup than generic productivity apps and who do not
            want to build their own system from scratch.
          </p>
          <p>
            Start with a free account, then upgrade later if you want marks, insights, and future advanced features.
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