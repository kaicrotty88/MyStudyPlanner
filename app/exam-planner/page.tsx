import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Exam Planner for Students | MyStudyPlanner",
  description:
    "Use MyStudyPlanner as an exam planner for students to organise exam dates, revision sessions, assignments, and marks in one place.",
  alternates: { canonical: "/exam-planner" },
  openGraph: {
    title: "Exam Planner for Students | MyStudyPlanner",
    description:
      "Organise exam dates, revision sessions, assignments, and marks in one student planner.",
    url: "/exam-planner",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Planner for Students | MyStudyPlanner",
    description:
      "An exam planner for students to organise revision, deadlines, and marks in one place.",
  },
};

const benefits = [
  {
    title: "See exam dates clearly",
    description: "Keep exams visible alongside assignments and homework instead of managing them separately.",
  },
  {
    title: "Plan revision sessions",
    description: "Use study sessions to spread revision over time instead of leaving it all to the last week.",
  },
  {
    title: "Stay balanced",
    description: "See how exams fit with your broader workload across all subjects.",
  },
  {
    title: "Review marks",
    description: "Track results and get a better sense of how each subject is going.",
  },
];

export default function ExamPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For exams and revision</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Exam planner for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps students organise exam dates, revision sessions, assignments, and marks in one place so
          exam season feels more manageable.
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
        <h2 className="text-lg font-semibold text-foreground">Why an exam planner helps</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Exams are easier to handle when revision is planned earlier and the full workload stays visible.
          </p>
          <p>
            Instead of treating exams as separate from assignments and weekly study, MyStudyPlanner lets you keep them
            together in one student planner.
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
        <h2 className="text-lg font-semibold text-foreground">How to use it for exam season</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>Start by adding your subjects and exam dates.</p>
          <p>
            Then add any remaining assignments or homework so your revision plan stays realistic.
          </p>
          <p>
            Use study sessions to spread revision throughout the week, then review marks and progress as results come
            back.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/assignment-tracker-for-students" className="text-muted-foreground transition hover:text-foreground">
          Assignment tracker for students
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