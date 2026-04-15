import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Online Study Planner | MyStudyPlanner",
  description:
    "Use MyStudyPlanner as an online study planner to organise assignments, homework, exams, study sessions, and marks in one place.",
  alternates: { canonical: "/online-study-planner" },
  openGraph: {
    title: "Online Study Planner | MyStudyPlanner",
    description:
      "An online study planner to organise assignments, homework, exams, study sessions, and marks in one place.",
    url: "/online-study-planner",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Study Planner | MyStudyPlanner",
    description:
      "An online study planner for students to keep school and university work organised.",
  },
};

const benefits = [
  {
    title: "Access it anywhere",
    description: "Use one planner across devices instead of relying on paper notes or scattered apps.",
  },
  {
    title: "Keep work in one place",
    description: "Assignments, homework, exams, study sessions, and marks stay together in one workflow.",
  },
  {
    title: "Stay clear on priorities",
    description: "See what is due next and what needs attention without dashboard clutter.",
  },
  {
    title: "Built for students",
    description: "Designed around how student life actually works, not around generic productivity systems.",
  },
];

export default function OnlineStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground">
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">Online planning</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Online study planner
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is an online study planner that helps students organise assignments, homework, exams, study
          sessions, and marks in one calm place.
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
        <h2 className="text-lg font-semibold text-foreground">Why use an online study planner</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            An online study planner makes it easier to keep your school or university workload organised without
            depending on memory, paper lists, or separate apps for every part of student life.
          </p>
          <p>
            MyStudyPlanner is designed to keep the important things together in one place while staying clean and
            student-first.
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
        <h2 className="text-lg font-semibold text-foreground">What MyStudyPlanner includes</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>Use it to manage subjects, track assignments and homework, plan study sessions, and review marks.</p>
          <p>
            Start with a free account for the core planner, then upgrade later if you want marks, insights, and future
            advanced features.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/free-study-planner" className="text-muted-foreground transition hover:text-foreground">
          Free study planner
        </Link>
        <Link href="/student-planner-app" className="text-muted-foreground transition hover:text-foreground">
          Student planner app
        </Link>
        <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
          How it works
        </Link>
      </div>
    </main>
  );
}