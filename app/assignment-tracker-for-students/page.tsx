import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Assignment Tracker for Students | MyStudyPlanner",
  description:
    "Use MyStudyPlanner as an assignment tracker for students to keep assignments, homework, deadlines, and study sessions organised in one place.",
  alternates: { canonical: "/assignment-tracker-for-students" },
  openGraph: {
    title: "Assignment Tracker for Students | MyStudyPlanner",
    description:
      "Track assignments, homework, deadlines, and study sessions in one student planner.",
    url: "/assignment-tracker-for-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assignment Tracker for Students | MyStudyPlanner",
    description:
      "An assignment tracker for students to keep deadlines and study sessions organised.",
  },
};

const points = [
  "Track assignments and homework by subject",
  "Keep due dates visible in one place",
  "Plan study sessions around upcoming deadlines",
  "Reduce the risk of missing work during busy weeks",
];

export default function AssignmentTrackerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For assignments and deadlines</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Assignment tracker for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps students keep assignments, homework, due dates, and study sessions organised in one
          place instead of scattering them across different tools.
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
        <h2 className="text-lg font-semibold text-foreground">Why use an assignment tracker</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Assignments often become hard to manage when they are spread between notes, reminders, calendar entries,
            and memory.
          </p>
          <p>
            An assignment tracker helps you keep deadlines visible, connect work to the right subject, and plan study
            time around what is due next.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">How MyStudyPlanner helps</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Add subjects, enter assignments and homework, and keep due dates easy to review during the week.
          </p>
          <p>
            Then use study sessions to break work into smaller pieces instead of leaving everything until the deadline.
          </p>
          <p>
            MyStudyPlanner is built specifically for students, so the workflow stays closer to how school and university
            work actually feels.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/exam-planner" className="text-muted-foreground transition hover:text-foreground">
          Exam planner
        </Link>
        <Link href="/study-planner-for-university-students" className="text-muted-foreground transition hover:text-foreground">
          Study planner for university students
        </Link>
        <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
          How it works
        </Link>
      </div>
    </main>
  );
}