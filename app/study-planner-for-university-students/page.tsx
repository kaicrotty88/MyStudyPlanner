import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Study Planner for University Students | MyStudyPlanner",
  description:
    "A calm study planner for university students. Organise assignments, exams, study sessions, reminders, and marks in one place with MyStudyPlanner.",
  alternates: { canonical: "/study-planner-for-university-students" },
  openGraph: {
    title: "Study Planner for University Students | MyStudyPlanner",
    description:
      "Organise assignments, exams, study sessions, reminders, and marks with a study planner built for university students.",
    url: "/study-planner-for-university-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Planner for University Students | MyStudyPlanner",
    description:
      "A calm study planner for university students to manage assignments, exams, study sessions, reminders, and marks.",
  },
};

const benefits = [
  {
    title: "Keep subjects together",
    description:
      "Track multiple units without splitting your workload across separate apps, notes, and reminders.",
  },
  {
    title: "Stay on top of deadlines",
    description:
      "See assignments, exams, homework, and due dates in one university planning workflow.",
  },
  {
    title: "Plan study sessions properly",
    description:
      "Log study time in a way that stays practical during busy weeks, mid-semester, and exams.",
  },
  {
    title: "Track marks over the semester",
    description:
      "Keep a clearer picture of how your subjects are going as results come back.",
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
          MyStudyPlanner is a calm study planner for university students who want
          one place to organise assignments, homework, exams, study sessions,
          reminders, and marks without building a complicated system from
          scratch.
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
        <h2 className="text-lg font-semibold text-foreground">
          Why university students need a proper study planner
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            University work gets messy quickly. You might have lectures,
            tutorials, readings, assignments, quizzes, exams, and random
            reminders all happening at once. Most students begin with a mix of
            calendar events, notes apps, and memory. That usually works for a
            little while, then semester gets busy and everything starts living in
            different places.
          </p>
          <p>
            A proper study planner for university students helps because it gives
            you one place to actually see the workload. Instead of trying to
            remember what is due, what needs study time, and what subject is
            falling behind, you can keep those things together and make better
            decisions earlier.
          </p>
          <p>
            That is the job of MyStudyPlanner. It is not trying to be a giant
            productivity system. It is a simple planner that helps university
            students stay organised without turning planning into extra work.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          What to keep track of during semester
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            A useful university planner needs to do more than hold a few due
            dates. Real semester planning usually means keeping track of
            assignments, homework, exam dates, study sessions, reminders, and
            results across multiple units at once.
          </p>
          <p>
            When those things are spread across separate tools, it becomes harder
            to see the full picture. You might have an essay deadline in one
            place, a study schedule somewhere else, and reminders sitting in your
            phone. None of those tools really show how the workload fits
            together.
          </p>
          <p>
            MyStudyPlanner helps by keeping subjects, tasks, study sessions, and
            marks closer together. That makes it easier to tell what is due next,
            what needs more time, and what can wait.
          </p>

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
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          How MyStudyPlanner helps you stay organised
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is designed to stay practical. You can add your units,
            enter assignments and exams, log study sessions, and keep reminders
            nearby without feeling like you are setting up a whole system just to
            get started.
          </p>
          <p>
            That matters at university because the pressure usually comes from
            combinations of deadlines rather than one giant task. A lab report, a
            reading quiz, an essay plan, and exam revision can all land in the
            same week. When that happens, clarity matters more than complexity.
          </p>
          <p>
            With a calm planner, you can see what is due next, plan study time
            around real tasks, and keep each subject visible across the semester.
            That makes it easier to stay ahead without feeling like your planner
            is another thing to maintain.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          A calmer way to manage assignments and exams
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Many students try generic productivity apps first. The problem is
            that those tools are often built for work projects, not university
            life. They can feel too broad, too cluttered, or too demanding to
            keep updated once semester gets busy.
          </p>
          <p>
            MyStudyPlanner is different because it stays focused on what students
            actually need. Assignments, exam dates, study sessions, reminders,
            and marks are already part of the workflow. You do not have to force
            a work-style system into something that fits study.
          </p>
          <p>
            The point is not to optimise every second of your week. It is to make
            your workload feel clearer and easier to manage.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            The easiest way to see if MyStudyPlanner fits how you work is to try
            the demo first. The demo shows the real planner with sample data, so
            you can click through the dashboard, calendar, tasks, study log,
            insights, marks, reminders, and settings.
          </p>
          <p>
            Then if it feels right, you can create a free account and start with
            your own subjects and deadlines. You do not need a perfect setup to
            get value from it. Even a few real tasks in the planner can make the
            week feel much clearer.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Try demo first
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Create free account
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          Related student planning pages
        </h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link
            href="/assignment-planner-for-university-students"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Assignment planner for university students
          </Link>
          <Link
            href="/student-planner-app"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Student planner app
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