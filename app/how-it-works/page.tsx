import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "How MyStudyPlanner Works | Online Study Planner for Students",
  description:
    "See how MyStudyPlanner works as an online study planner for students: add subjects, track assignments and exams, plan study sessions, and review marks.",
  keywords: [
    "how MyStudyPlanner works",
    "online study planner",
    "how to use a study planner",
    "student planner workflow",
    "assignment tracker for students",
    "exam planner for students",
    "study session planner",
    "marks tracker for students",
  ],
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How MyStudyPlanner Works | Online Study Planner for Students",
    description:
      "Set up subjects, track assignments and exams, plan study sessions, and review marks in one online study planner.",
    url: "/how-it-works",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How MyStudyPlanner Works | Online Study Planner for Students",
    description:
      "An online study planner for students to manage subjects, assignments, exams, study sessions, and marks.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How MyStudyPlanner Works",
  url: "https://mystudyplanner.co/how-it-works",
  description:
    "How to use MyStudyPlanner to manage subjects, assignments, exams, study sessions, and marks.",
  mainEntity: {
    "@type": "HowTo",
    name: "How to use MyStudyPlanner",
    step: [
      {
        "@type": "HowToStep",
        name: "Set up your subjects",
        text: "Add your subjects and give them colours so your student planner stays clear at a glance.",
      },
      {
        "@type": "HowToStep",
        name: "Add assignments, homework, and exams",
        text: "Keep important deadlines visible so you know what matters next.",
      },
      {
        "@type": "HowToStep",
        name: "Plan study sessions",
        text: "Log study sessions quickly without building a complicated planning system.",
      },
      {
        "@type": "HowToStep",
        name: "Review marks and progress",
        text: "Use marks and insights to keep a clearer view of how each subject is going.",
      },
    ],
  },
};

const steps = [
  {
    k: "01",
    title: "Set up your subjects",
    desc: "Add subjects with distinct colours so your online study planner stays easy to read throughout the week.",
  },
  {
    k: "02",
    title: "Add assignments, homework, and exams",
    desc: "Track assessments, deadlines, and due dates so the most important work is always visible.",
  },
  {
    k: "03",
    title: "Plan and log study sessions",
    desc: "Keep study planning practical by logging sessions quickly instead of building an overcomplicated system.",
  },
  {
    k: "04",
    title: "Review marks and adjust",
    desc: "Use marks and insights to see progress across your subjects and decide where to focus next.",
  },
];

const features = [
  {
    title: "One student workflow",
    desc: "Subjects, assignments, exams, study sessions, and marks work together in one place.",
  },
  {
    title: "Clear weekly planning",
    desc: "See what is due, what you have studied, and what needs attention next.",
  },
  {
    title: "Quick logging",
    desc: "Track study sessions without making the app feel like extra homework.",
  },
  {
    title: "Useful visibility",
    desc: "Get a clearer picture of workload and progress without dashboard clutter.",
  },
];

const faqs = [
  {
    q: "Is MyStudyPlanner free to use?",
    a: "Yes. You can start with a free account for the core planner features, then upgrade later for marks, insights, and future advanced features.",
  },
  {
    q: "Is MyStudyPlanner for high school or university students?",
    a: "Both. It is designed around subjects, assignments, homework, exams, study sessions, and marks, so it works for high school and university study.",
  },
  {
    q: "Do I need to plan everything ahead of time?",
    a: "No. Start with your subjects and next few deadlines, then add study sessions as you go.",
  },
  {
    q: "What is the best way to start?",
    a: "Add your subjects first, then enter your next assignments or exams, and begin logging study sessions during the week.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-5">
        <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          How it works
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            How to use MyStudyPlanner as your online study planner.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            MyStudyPlanner helps students organise subjects, assignments, homework, exams, study sessions, and marks in
            one calm place so it is easier to stay on top of school or university work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Open demo
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Create free account
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground transition hover:text-foreground">
            About MyStudyPlanner →
          </Link>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">The workflow</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              You do not need a complicated productivity system. Start with the essentials, keep your study planner
              current, and use it to stay clear on what matters next.
            </p>

            <div className="mt-6 space-y-3">
              {steps.map((s) => (
                <div key={s.k} className="rounded-2xl border border-border bg-background/60 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground md:text-base">{s.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</div>
                    </div>
                    <div className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {s.k}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
              Best starting point: add your subjects, enter your next assignments or exams, then log study sessions as
              you work through the week.
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">Why this workflow works</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{faq.q}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6 md:p-7">
              <h2 className="text-base font-semibold text-foreground">Core features</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The main tools students actually need in an online study planner.
              </p>
            </div>

            <div className="space-y-4 p-6 md:p-7">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Subjects and colour coding</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Stay organised at a glance without making your planner visually busy.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Assignments and exams</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Keep due dates visible so you know what to prioritise next.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Study session tracking</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Log sessions quickly and build a clearer picture of your consistency over time.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Marks and insights</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Review progress across subjects without needing a separate tool.
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/demo"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  Try the demo
                </Link>
                <div className="mt-2 text-center text-[11px] text-muted-foreground">
                  Or{" "}
                  <Link href="/sign-up" className="underline transition hover:text-foreground">
                    create a free account
                  </Link>{" "}
                  to save your setup.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}