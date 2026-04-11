import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "About MyStudyPlanner | Built for Students",
  description:
    "Learn why MyStudyPlanner exists and how it was built for students who want a simpler way to keep track of subjects, assessments, and study.",
  keywords: [
    "about MyStudyPlanner",
    "student study planner",
    "study planner for students",
    "high school study planner",
    "university study planner",
    "student planner app",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MyStudyPlanner | Built for Students",
    description:
      "MyStudyPlanner was built for students who want a simpler way to organise school, assessments, and study.",
    url: "/about",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About MyStudyPlanner | Built for Students",
    description:
      "A study planner built for students who want something simpler and more useful.",
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
    "Learn why MyStudyPlanner exists and how it was built for students who want a simpler way to stay organised.",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "MyStudyPlanner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://mystudyplanner.co",
    description:
      "A student study planner for organising subjects, assessments, and study sessions in one place.",
  },
};

export default function AboutPage() {
  const values = [
    {
      title: "Built for students",
      desc: "Everything starts with how students actually think about school: subjects, tasks, assessments, and study time.",
    },
    {
      title: "Simple to use",
      desc: "The goal is not to create a bigger system. It is to make it easier to stay on top of the one you already have.",
    },
    {
      title: "Useful every week",
      desc: "A planner only works if you keep using it, so MyStudyPlanner is designed to feel straightforward day to day.",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-3xl space-y-4">
        <p className="text-sm text-muted-foreground">About</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Built for students who want something simpler.
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner was made for students who want one place to keep track of school without turning organisation
          into another job.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Open demo
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            How it works
          </Link>
        </div>
      </header>

      <section className="mt-10 space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Why it exists</h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              A lot of student planners either feel too empty to be useful or too overdone to stick with. They ask you
              to manage boards, systems, and workflows when what you really need is a clear place to keep up with
              school.
            </p>

            <p>
              MyStudyPlanner was built to be more direct. Keep track of your subjects, see what is due, log your study,
              and keep moving.
            </p>

            <p>
              It is not trying to be a productivity machine. It is just meant to help students stay organised in a way
              that feels natural and easy to come back to.
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
          <h2 className="text-lg font-semibold text-foreground">What MyStudyPlanner is for</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">Keeping school in one place</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Subjects, assessments, tasks, and study sessions should not be spread across five different tools.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">Making organisation feel lighter</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The point is to help you stay on top of things, not make planning feel heavier than the work itself.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Want to see the product?</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Try the demo or read how it works.
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
                href="/how-it-works"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-muted/60"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}