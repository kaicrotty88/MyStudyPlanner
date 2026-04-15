import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Study Planner for High School Students | MyStudyPlanner",
  description:
    "MyStudyPlanner is a study planner for high school students to organise homework, assignments, exams, study sessions, and marks in one place.",
  alternates: { canonical: "/study-planner-for-high-school-students" },
  openGraph: {
    title: "Study Planner for High School Students | MyStudyPlanner",
    description:
      "Organise homework, assignments, exams, study sessions, and marks with a study planner built for high school students.",
    url: "/study-planner-for-high-school-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Planner for High School Students | MyStudyPlanner",
    description:
      "A study planner for high school students to manage homework, assignments, exams, study sessions, and marks.",
  },
};

const benefits = [
  {
    title: "Keep school work together",
    description: "Homework, assignments, exams, and study sessions can stay in one place instead of being scattered.",
  },
  {
    title: "Stay on top of deadlines",
    description: "See what is due next and what needs attention before work builds up.",
  },
  {
    title: "Make study more consistent",
    description: "Use study sessions to spread work across the week instead of leaving everything late.",
  },
  {
    title: "Track progress",
    description: "Marks help you get a clearer sense of how each subject is going over time.",
  },
];

export default function HighSchoolStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For high school students</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Study planner for high school students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps high school students organise homework, assignments, exams, study sessions, and marks in
          one calm planner built for real student life.
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
        <h2 className="text-lg font-semibold text-foreground">Why high school students use it</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            High school work can pile up quickly when homework, assignments, and exam prep all compete for attention at
            the same time.
          </p>
          <p>
            MyStudyPlanner helps keep those parts together in one place so it is easier to stay organised without
            building a complicated system.
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
        <h2 className="text-lg font-semibold text-foreground">What you can organise</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Add your subjects, keep track of homework and assignments, and plan study sessions around tests and exams.
          </p>
          <p>
            Then use marks to build a clearer picture of your progress as the term goes on.
          </p>
          <p>
            MyStudyPlanner is built to feel calm and practical, not like another generic productivity app.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/homework-planner-for-students" className="text-muted-foreground transition hover:text-foreground">
          Homework planner for students
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