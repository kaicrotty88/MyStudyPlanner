import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "How MyStudyPlanner Works | Study Planner for Students",
  description:
    "See how MyStudyPlanner works: add subjects, track assessments, plan study sessions, and stay on top of deadlines with a calm online study planner for students.",
  keywords: [
    "how MyStudyPlanner works",
    "how to use a study planner",
    "student planner workflow",
    "online study planner",
    "study planner for high school students",
    "study planner for university students",
    "track assignments and exams",
    "study session planner",
  ],
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How MyStudyPlanner Works | Study Planner for Students",
    description:
      "Set up subjects, add assessments, log study sessions, and review your week with a calm online study planner for students.",
    url: "/how-it-works",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How MyStudyPlanner Works | Study Planner for Students",
    description:
      "A calm online study planner for students to manage subjects, assessments, and study sessions.",
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
    "How to use MyStudyPlanner to manage subjects, deadlines, and study sessions.",
  mainEntity: {
    "@type": "HowTo",
    name: "How to use MyStudyPlanner",
    step: [
      {
        "@type": "HowToStep",
        name: "Set up your subjects",
        text: "Add your subjects and give them colours so your planner stays clear at a glance.",
      },
      {
        "@type": "HowToStep",
        name: "Add assessments and tasks",
        text: "Keep exams, assignments, and due dates visible so you know what matters next.",
      },
      {
        "@type": "HowToStep",
        name: "Plan and log study sessions",
        text: "Track your study sessions quickly without turning planning into extra work.",
      },
      {
        "@type": "HowToStep",
        name: "Review your week",
        text: "Use your weekly view and insights to stay consistent and adjust early.",
      },
    ],
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      k: "01",
      title: "Set up your subjects",
      desc: "Add subjects with distinct colours so your planner stays easy to read throughout the week.",
    },
    {
      k: "02",
      title: "Add assessments and deadlines",
      desc: "Track exams, assignments, homework, and upcoming due dates so nothing important gets buried.",
    },
    {
      k: "03",
      title: "Plan and log study sessions",
      desc: "Keep study planning practical by logging sessions fast instead of building a complicated system.",
    },
    {
      k: "04",
      title: "Review your week and adjust",
      desc: "Use your planner to see what you have done, what is coming up, and where to refocus next.",
    },
  ];

  const features = [
    {
      title: "Calm design",
      desc: "A cleaner layout that helps you focus on your workload instead of dashboard clutter.",
    },
    {
      title: "Real student workflow",
      desc: "Subjects, assessments, sessions, and deadlines work together in one place.",
    },
    {
      title: "Quick logging",
      desc: "Track study time without making the app feel like extra homework.",
    },
    {
      title: "Useful visibility",
      desc: "See what matters now and what is building up next so you can respond earlier.",
    },
  ];

  const faqs = [
    {
      q: "Is MyStudyPlanner free to use?",
      a: "Yes. You can explore the planner with demo data and use the core workflow without making the experience complicated.",
    },
    {
      q: "Is MyStudyPlanner for high school or university students?",
      a: "Both. It is designed around subjects, assessments, deadlines, and study sessions, so it works well for high school and university study.",
    },
    {
      q: "Do I need to plan everything ahead of time?",
      a: "No. Start with your subjects and your next few deadlines, then log study sessions as you go.",
    },
    {
      q: "What is the best way to start?",
      a: "Add your subjects first, then enter your next assignments or exams, and begin logging sessions during the week.",
    },
  ];

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
            A simple study planning workflow that feels easy to keep up with.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            MyStudyPlanner helps students organise subjects, assessments, deadlines, and study sessions in one calm
            place so it is easier to stay consistent without overplanning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Open planner
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Create account
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground transition hover:text-foreground">
            About MyStudyPlanner →
          </Link>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">The workflow</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              You do not need a complicated productivity system. Start with the essentials, keep your planner current,
              and let the app support your study routine instead of taking it over.
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
              Best starting point: add your subjects, enter your next few deadlines, then log sessions as you study.
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">Why the workflow works</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((x) => (
                <div key={x.title} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{x.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{x.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{f.q}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border p-6 md:p-7">
              <h2 className="text-base font-semibold text-foreground">Core features</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The essentials students actually need, presented in a cleaner way.
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
                <div className="text-sm font-semibold text-foreground">Assessments and due dates</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Keep important deadlines visible so you know what to prioritise next.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Study session tracking</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Log sessions quickly and build a clearer picture of your consistency over time.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Weekly clarity</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Review your workload and progress without a dashboard that feels overwhelming.
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
                    create an account
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