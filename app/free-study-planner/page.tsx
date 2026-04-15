import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Free Study Planner | MyStudyPlanner",
  description:
    "Start with a free study planner for students. MyStudyPlanner helps organise assignments, homework, exams, and study sessions in one place.",
  alternates: { canonical: "/free-study-planner" },
  openGraph: {
    title: "Free Study Planner | MyStudyPlanner",
    description:
      "A free study planner for students to organise assignments, homework, exams, and study sessions.",
    url: "/free-study-planner",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study Planner | MyStudyPlanner",
    description:
      "Start with a free study planner for students and upgrade later only if you need more.",
  },
};

const freeFeatures = [
  "Organise assignments, homework, and exams",
  "Plan study sessions in one place",
  "Manage subjects and weekly workload",
  "Save your planner with a free account",
];

export default function FreeStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <header className="max-w-3xl space-y-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground">
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">Free plan</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Free study planner
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner lets students start with a free study planner for organising assignments, homework, exams, and
          study sessions in one place.
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
        <h2 className="text-lg font-semibold text-foreground">What the free plan gives you</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {freeFeatures.map((feature) => (
            <div key={feature} className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Why start free</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Starting with a free study planner lowers the barrier to getting organised. You can use the core planning
            workflow first, then decide later whether Premium features like marks and insights are worth it for you.
          </p>
          <p>
            That makes MyStudyPlanner easier to try without committing to a more complex setup.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/online-study-planner" className="text-muted-foreground transition hover:text-foreground">
          Online study planner
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