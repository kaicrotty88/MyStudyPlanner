// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "MyStudyPlanner | Calm Online Study Planner for Students",
  description:
    "MyStudyPlanner is a calm online study planner for high school and university students. Organise subjects, track assessments, plan study sessions, and stay on top of deadlines without clutter.",
  keywords: [
    "online study planner",
    "study planner for students",
    "high school study planner",
    "university study planner",
    "student planner",
    "assessment planner",
    "study session tracker",
    "assignment planner",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "Organise subjects, track assessments, plan study sessions, and stay on top of deadlines in one calm place.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "A calm online study planner for high school and university students.",
  },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  const steps = [
    {
      title: "Add your subjects",
      desc: "Set up your subjects once so your planner matches your real school week.",
    },
    {
      title: "Track assessments",
      desc: "Keep exams, assignments, and due dates visible instead of buried in notes.",
    },
    {
      title: "Log study sessions",
      desc: "Build consistency with quick session logging that does not feel like extra work.",
    },
  ];

  const highlights = [
    "Built for high school and university students",
    "Free to try with demo data",
    "Clean layout with no busy dashboard",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground md:inline-flex"
            >
              About
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="relative py-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-muted/35 blur-3xl" />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7 text-center md:text-left">
              <div className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                Calm planning for real student life
              </div>

              <h1 className="mx-auto mt-4 max-w-[15ch] text-4xl font-semibold tracking-tight text-foreground md:mx-0 md:text-6xl md:leading-[1.03]">
                Stay on top of school without the clutter.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground md:mx-0 md:text-lg md:leading-8">
                MyStudyPlanner helps high school and university students organise subjects, track assessments, plan
                study sessions, and stay consistent in one calm place.
              </p>

              <div className="mt-7 grid w-full max-w-md grid-cols-1 gap-3 sm:mx-auto sm:grid-cols-2 md:mx-0">
                <Link
                  href="/demo"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Try it now
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
                >
                  Create account
                </Link>
              </div>

              <div className="mx-auto mt-3 max-w-md text-[11px] text-muted-foreground opacity-80 md:mx-0">
                Free to explore. Opens with demo data. Create an account to save and sync across devices.
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1.5 text-[11px] text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-5 py-4">
                  <div className="text-sm font-semibold text-foreground">Built for real student life</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Clean, practical, and designed around how school actually runs.
                  </div>
                </div>

                <div className="space-y-5 px-5 py-4">
                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">See your week clearly</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        One place for subjects, study, and assessments without the busy feeling.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Stay consistent</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Log study sessions quickly and build momentum without overplanning every detail.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Spot patterns early</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Track marks, workload, and progress so you can adjust before things pile up.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
                  Built by students who were sick of overcomplicated planners.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12 md:pb-14">
          <div className="rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-5 md:px-8">
              <div className="text-sm font-semibold text-foreground">How it works</div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Start simple. Set up what matters, keep your deadlines visible, and log study as you go.
              </p>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-border bg-background/60 p-5">
                  <div className="text-xs font-semibold text-muted-foreground">0{index + 1}</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">{step.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
              <div className="text-sm text-muted-foreground">
                Want more detail? Learn more about{" "}
                <Link href="/about" className="text-foreground underline underline-offset-4 transition hover:opacity-80">
                  why MyStudyPlanner exists
                </Link>{" "}
                or{" "}
                <Link
                  href="/how-it-works"
                  className="text-foreground underline underline-offset-4 transition hover:opacity-80"
                >
                  how it works
                </Link>
                .
              </div>

              <Link
                href="/demo"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
              >
                Open demo
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyStudyPlanner</div>

            <div className="flex items-center gap-4 text-xs">
              <Link href="/about" className="text-muted-foreground transition hover:text-foreground">
                About
              </Link>
              <Link href="/how-it-works" className="text-muted-foreground transition hover:text-foreground">
                How it works
              </Link>
              <Link href="/privacy" className="text-muted-foreground transition hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground transition hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}