import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "About MyStudyPlanner | Calm Online Study Planner for Students",
  description:
    "Learn about MyStudyPlanner, a calm online study planner built for high school and university students to manage subjects, assessments, deadlines, and study sessions.",
  keywords: [
    "about MyStudyPlanner",
    "online study planner",
    "study planner for students",
    "student planner app",
    "high school study planner",
    "university study planner",
    "assessment planner",
    "study session tracker",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "MyStudyPlanner is a calm, minimal study planner built around real student life: subjects, assessments, deadlines, and study sessions in one place.",
    url: "/about",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "A calm online study planner for high school and university students.",
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
    "About MyStudyPlanner, a calm online study planner for high school and university students.",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "MyStudyPlanner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://mystudyplanner.co",
    description:
      "A calm online study planner for students to organise subjects, assessments, deadlines, and study sessions.",
  },
};

export default function AboutPage() {
  const checklist = [
    { title: "Track assessments", desc: "Keep exams, assignments, and due dates visible instead of scattered across tabs and notes." },
    { title: "Log study sessions", desc: "Build momentum with quick session logging that feels easy enough to keep using." },
    { title: "See your week clearly", desc: "Get a cleaner view of what matters now and what is coming up next." },
    { title: "Learn from patterns", desc: "Use your study history and workload view to adjust before things pile up." },
  ];

  const principles = [
    {
      title: "Built around real school structure",
      desc: "Subjects, tasks, assessments, and study sessions belong together because that is how students actually work.",
    },
    {
      title: "Calm by default",
      desc: "The interface stays minimal so the planner helps you focus instead of becoming another source of noise.",
    },
    {
      title: "Fast enough to use every day",
      desc: "The app is designed to reduce friction, so logging and planning stay quick even during busy weeks.",
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
          About MyStudyPlanner
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            A calm online study planner built for real student life.
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            MyStudyPlanner is designed for high school and university students who want one clear place to manage
            subjects, assessments, deadlines, and study sessions without the clutter of an overbuilt productivity app.
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
            Create account
          </Link>
          <Link href="/how-it-works" className="text-sm text-muted-foreground transition hover:text-foreground">
            See how it works →
          </Link>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">Why it exists</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                Students already juggle subjects, assignments, exams, revision, and weekly planning. Many planners are
                either too empty to be useful or so feature-heavy they create more friction than clarity.
              </p>
              <p>
                MyStudyPlanner was built to solve that gap with a calmer approach: show what is due, what is next, and
                what you have actually studied in a way that feels obvious and easy to keep up with.
              </p>
              <p>
                The goal is simple. Help students stay organised, consistent, and less overwhelmed during the school
                term without changing how they naturally think about their workload.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">What students can do with MyStudyPlanner</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {checklist.map((x) => (
                <div key={x.title} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm font-semibold text-foreground">{x.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{x.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-foreground">Privacy-first mindset</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              MyStudyPlanner is built to stay practical and respectful. You can explore with demo data, keep your setup
              simple, and use the app without the feeling that your planner is doing more than it needs to.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-background/50 px-4 py-3 text-xs text-muted-foreground">
              Looking for the details? Visit the <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>{" "}
              and <Link href="/terms" className="underline hover:text-foreground">Terms of Use</Link>.
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Ready to try it?</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Open the planner and see the workflow with no setup.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/demo"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  Open demo
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-muted/60"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border p-6">
              <h2 className="text-base font-semibold text-foreground">What makes it different</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A cleaner planner focused on clarity, consistency, and real student workflows.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">No noisy dashboard</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  See the essentials without distractions or overdesigned widgets.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Made for school and uni</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Works well for high school students, university students, and anyone studying with deadlines.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-sm font-semibold text-foreground">Simple enough to stick with</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Planning and logging stay light, which makes long-term consistency easier.
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/how-it-works"
                  className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}