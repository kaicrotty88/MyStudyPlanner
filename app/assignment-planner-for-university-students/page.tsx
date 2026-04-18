import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Assignment Planner for University Students | MyStudyPlanner",
  description:
    "MyStudyPlanner helps university students plan assignments, manage deadlines, and keep study sessions organised in one place.",
  alternates: { canonical: "/assignment-planner-for-university-students" },
  openGraph: {
    title: "Assignment Planner for University Students | MyStudyPlanner",
    description:
      "Plan university assignments, manage deadlines, and organise study sessions in one calm planner.",
    url: "/assignment-planner-for-university-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assignment Planner for University Students | MyStudyPlanner",
    description:
      "An assignment planner for university students to manage deadlines and study sessions.",
  },
};

const benefits = [
  {
    title: "Track multiple assignments",
    description:
      "Keep work from different units visible in one place instead of splitting it across apps.",
  },
  {
    title: "See deadlines clearly",
    description:
      "Stay aware of what is due next so you can prioritise earlier.",
  },
  {
    title: "Plan work over time",
    description:
      "Use study sessions to break assignments into manageable pieces.",
  },
  {
    title: "Stay calmer during semester",
    description:
      "A clearer assignment plan makes heavy university workloads feel easier to manage.",
  },
];

export default function AssignmentPlannerForUniversityStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For university assignments</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Assignment planner for university students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps university students organise assignments, deadlines,
          and study sessions in one place so semester workloads are easier to manage.
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
        <h2 className="text-lg font-semibold text-foreground">Why it helps</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            University assignments often pile up because they arrive across
            multiple units with different due dates and different workload sizes.
          </p>
          <p>
            A dedicated assignment planner helps you keep them visible, space them
            out, and stay clearer on what matters next.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background/60 p-4"
            >
              <div className="text-sm font-semibold text-foreground">
                {item.title}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          How MyStudyPlanner fits university work
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Add your units, enter assignments, and keep deadlines close to your
            study sessions and exam prep.
          </p>
          <p>
            That makes it easier to plan realistically instead of reacting to
            deadlines at the last minute.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          Related student planning pages
        </h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link
            href="/study-planner-for-university-students"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Study planner for university students
          </Link>
          <Link
            href="/assignment-tracker-for-students"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Assignment tracker for students
          </Link>
          <Link
            href="/online-study-planner"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Online study planner
          </Link>
        </div>
      </section>
    </main>
  );
}