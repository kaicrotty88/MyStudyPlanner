import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "About MyStudyPlanner | Study Planner for Students",
  description:
    "Learn what MyStudyPlanner is, who it is for, and why it was built as a study planner for high school and university students.",
  keywords: [
    "about MyStudyPlanner",
    "study planner for students",
    "student planner app",
    "online study planner",
    "high school study planner",
    "university study planner",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MyStudyPlanner | Study Planner for Students",
    description:
      "MyStudyPlanner is a study planner for students who want one place for assignments, exams, study sessions, and marks.",
    url: "/about",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About MyStudyPlanner | Study Planner for Students",
    description:
      "A study planner for students who want one place to organise assignments, exams, and study.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About MyStudyPlanner",
  url: "https://mystudyplanner.co/about",
  description:
    "Learn what MyStudyPlanner is and why it was built as a study planner for students.",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "MyStudyPlanner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://mystudyplanner.co",
    description:
      "A web-based study planner for high school and university students to organise assignments, homework, exams, study sessions, and marks.",
  },
};

const values = [
  {
    title: "Built for students",
    desc: "Designed around subjects, assignments, exams, study sessions, and marks instead of generic productivity systems.",
  },
  {
    title: "Clear to use",
    desc: "The goal is to help students stay organised without turning planning into another layer of work.",
  },
  {
    title: "Useful over time",
    desc: "A student planner only matters if it is easy to keep using throughout the term, semester, or school year.",
  },
];

const useCases = [
  {
    title: "Assignment tracking",
    desc: "Keep upcoming assignments, homework, and due dates in one place so they are easier to prioritise.",
  },
  {
    title: "Exam planning",
    desc: "See exams, assessments, and revision work together instead of scattering them across different apps.",
  },
  {
    title: "Study session planning",
    desc: "Plan and log study sessions in a way that stays practical during busy weeks.",
  },
  {
    title: "Marks and progress",
    desc: "Use marks and insights to keep a clearer picture of how things are going across your subjects.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back
        </Link>

        <p className="text-sm text-muted-foreground">About</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          A study planner built for how student life actually works.
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is an online study planner for high school and university students who want one place to keep
          track of assignments, homework, exams, study sessions, and marks.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            How it works
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Create free account
          </Link>
        </div>
      </header>

      <section className="mt-10 space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Why MyStudyPlanner exists</h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Many students end up piecing together notes apps, task apps, calendars, and reminders just to stay on top
              of school or university. That works for a while, but it often becomes messy fast.
            </p>

            <p>
              MyStudyPlanner was built as a calmer alternative: one student planner where you can manage subjects,
              assignments, homework, exams, study sessions, and marks in one place.
            </p>

            <p>
              The aim is not to feel like a generic productivity app. It is to give students a planning tool that fits
              real academic workloads and is simple enough to keep coming back to each week.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {values.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">What students use it for</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link href="/study-planner-for-university-students" className="text-muted-foreground transition hover:text-foreground">
              Study planner for university students
            </Link>
            <Link href="/assignment-tracker-for-students" className="text-muted-foreground transition hover:text-foreground">
              Assignment tracker
            </Link>
            <Link href="/exam-planner" className="text-muted-foreground transition hover:text-foreground">
              Exam planner
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}