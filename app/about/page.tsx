import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | MyStudyPlanner",
  description:
    "About MyStudyPlanner — a calm, minimal online study planner built around real school structure: subjects, assessments, and study sessions.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const checklist = [
    { title: "Track assessments", desc: "Keep exams and assignments visible — not buried." },
    { title: "Log study sessions", desc: "Build momentum with fast, flexible logging." },
    { title: "See your week clearly", desc: "Know what’s coming up without the busy feeling." },
    { title: "Learn from results", desc: "Spot patterns and adjust before it’s too late." },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 md:px-10 py-12 md:py-14">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">About</p>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          Built for real student life.
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          MyStudyPlanner is a calm, simple study planner built around how school actually works — so you focus on doing
          the work, not managing tools.
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
          <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
            How it works →
          </Link>
        </div>
      </header>

      {/* Content grid */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">Why it exists</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
              Subjects, assessments, deadlines, and study sessions pile up fast. Most planners either feel too empty to
              be useful, or so complicated they become another thing to manage.
            </p>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              MyStudyPlanner was built by students who wanted one place that feels clean and obvious: what’s due,
              what’s next, and how consistent you’ve been — without noise.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">Designed to stay out of your way</h2>

            <ul className="mt-3 space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Real school structure:</span> subjects, assessments,
                  and study sessions live together.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Calm by default:</span> minimal UI, no gamification,
                  no loud dashboards.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Consistency wins:</span> logging is fast and flexible,
                  so it’s easy to keep going.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Useful insights:</span> see study time and results so
                  you can adjust early.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
              MyStudyPlanner is built with privacy in mind. You can explore with example data, and nothing is sold or
              shared. The app only stores what it needs to work — nothing more.
            </p>
          </div>

          {/* Bottom CTA strip */}
          <div className="rounded-2xl border border-border bg-muted/20 p-6 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Ready to try it?</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Open the demo in seconds — no setup needed.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/demo"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  Open demo
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted/60 transition"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Side card */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 md:p-7 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">What you can do</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A quick checklist of the core workflow MyStudyPlanner supports.
              </p>
            </div>

            <div className="p-6 md:p-7 space-y-4">
              {checklist.map((x) => (
                <div key={x.title} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{x.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{x.desc}</div>
                </div>
              ))}

              <div className="pt-1 text-xs text-muted-foreground">
                Built by students who were sick of overcomplicated planners.
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
