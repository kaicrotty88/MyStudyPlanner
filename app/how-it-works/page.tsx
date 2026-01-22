import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "How it works | MyStudyPlanner",
  description:
    "How MyStudyPlanner works: set up subjects, add assessments, plan study sessions, and track progress in a calm, minimal online study planner for students.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How it works | MyStudyPlanner",
    description:
      "Set up subjects, add assessments, plan study sessions, and track progress — in a calm, minimal online study planner for students.",
    url: "/how-it-works",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How it works | MyStudyPlanner",
    description:
      "A calm, minimal online study planner for high school and university students.",
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      k: "01",
      title: "Set up your subjects",
      desc: "Add subjects with colours so your week stays clear at a glance.",
    },
    {
      k: "02",
      title: "Add assessments and deadlines",
      desc: "Keep exams and assignments visible — not buried — so you always know what matters next.",
    },
    {
      k: "03",
      title: "Plan and log study sessions",
      desc: "Log sessions in seconds: subject, time, duration. No friction, no overplanning.",
    },
    {
      k: "04",
      title: "Review your week",
      desc: "See what you’ve done, what’s coming up, and stay consistent without a loud dashboard.",
    },
  ];

  const features = [
    {
      title: "Calm by default",
      desc: "Minimal UI, compact layout, and nothing distracting.",
    },
    {
      title: "Real school structure",
      desc: "Subjects, assessments, tasks, and study sessions all live together.",
    },
    {
      title: "Fast logging",
      desc: "Capture study time without turning it into another task.",
    },
    {
      title: "Helpful insights",
      desc: "See patterns early so you can adjust before it’s too late.",
    },
  ];

  const faqs = [
    {
      q: "Is MyStudyPlanner free?",
      a: "Yes — you can use the planner for free. You can also explore with demo data before creating an account.",
    },
    {
      q: "Is this a study planner for high school students?",
      a: "Yes. It’s designed around subjects, assessments, and weekly planning — the way school actually runs. It also works well for university.",
    },
    {
      q: "Do I need to plan everything in advance?",
      a: "No. MyStudyPlanner is built for consistency: add what’s due, then log study sessions as you go.",
    },
    {
      q: "What should I do first?",
      a: "Add 4–6 subjects, add your next two assessments, then start logging sessions. Keep it simple and build momentum.",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-10 py-12 md:py-14">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">How it works</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          A simple workflow for students — built around real school structure.
        </h1>
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          MyStudyPlanner is a calm online study planner for high school and university students. It’s designed to feel
          obvious: what’s due, what’s next, and what you’ve actually studied — without clutter.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
          >
            Open planner
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60 transition"
          >
            Create account
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Read the story →
          </Link>
        </div>
      </header>

      {/* Steps */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">The flow</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
              You don’t need a complicated system. Capture what matters, stay consistent, and let the planner stay out
              of your way.
            </p>

            <div className="mt-6 space-y-3">
              {steps.map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-border bg-background/60 p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{s.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {s.desc}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-muted-foreground/70">
                      {s.k}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
              Tip: start small. Add your subjects and the next two assessments — then log sessions as you go.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">What makes it different</h2>
            <ul className="mt-3 space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">No noise:</span> no gamification, no messy widgets,
                  no overwhelming dashboards.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">High signal:</span> compact and readable so you can
                  see your week clearly.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Built for consistency:</span> logging stays quick, so
                  you actually keep doing it.
                </span>
              </li>
            </ul>
          </div>

          {/* FAQ (SEO booster) */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{f.q}</div>
                  <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side card */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 md:p-7 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Core features</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                The essentials, done cleanly — so the app feels calm, not busy.
              </p>
            </div>

            <div className="p-6 md:p-7 space-y-4">
              {features.map((x) => (
                <div key={x.title} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{x.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{x.desc}</div>
                </div>
              ))}

              <div className="pt-1 text-xs text-muted-foreground">
                A calm online study planner for high school and university students.
              </div>

              <div className="pt-3">
                <Link
                  href="/demo"
                  className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
                >
                  Try it now
                </Link>
                <div className="mt-2 text-center text-[11px] text-muted-foreground">
                  Or <Link className="underline hover:text-foreground transition" href="/sign-up">create an account</Link>{" "}
                  to save your data.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
