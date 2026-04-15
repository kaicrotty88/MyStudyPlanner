import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Marks Tracker for Students | MyStudyPlanner",
  description:
    "Use MyStudyPlanner as a marks tracker for students to log results, review progress, and keep marks organised across subjects.",
  alternates: { canonical: "/marks-tracker-for-students" },
  openGraph: {
    title: "Marks Tracker for Students | MyStudyPlanner",
    description:
      "Track marks across subjects, review progress, and keep results organised in one student planner.",
    url: "/marks-tracker-for-students",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marks Tracker for Students | MyStudyPlanner",
    description:
      "A marks tracker for students to log results and review progress across subjects.",
  },
};

const benefits = [
  {
    title: "Keep results in one place",
    description: "Store marks by subject instead of losing them in portals, notes, or messages.",
  },
  {
    title: "See progress over time",
    description: "A clearer view of marks makes it easier to notice where you are improving or slipping.",
  },
  {
    title: "Connect marks to workload",
    description: "Marks make more sense when they sit alongside assignments, exams, and study sessions.",
  },
  {
    title: "Stay more informed",
    description: "A marks tracker helps you respond earlier instead of waiting until the end of term or semester.",
  },
];

export default function MarksTrackerForStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For marks and progress</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Marks tracker for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner helps students track marks across subjects, review progress, and keep results organised in one
          place alongside assignments, exams, and study sessions.
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
        <h2 className="text-lg font-semibold text-foreground">Why a marks tracker matters</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            It is hard to judge how a subject is going when results are scattered across portals, emails, and memory.
          </p>
          <p>
            A marks tracker gives you one place to log results and notice patterns earlier, especially when you are
            balancing multiple subjects.
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
        <h2 className="text-lg font-semibold text-foreground">How MyStudyPlanner helps</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Use MyStudyPlanner to log marks by subject and keep them close to your assignments, exams, and study
            sessions.
          </p>
          <p>
            That makes it easier to see not just the result, but the broader picture of your workload and progress.
          </p>
          <p>
            Marks and insights are part of Premium, which is designed for students who want a stronger view of their
            academic progress over time.
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