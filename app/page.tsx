import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm study planner for high school and university students. Plan study, manage assessments, track progress — without clutter.",
  alternates: { canonical: "/" },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              MyStudyPlanner
            </span>
            <span className="text-[11px] text-muted-foreground">
              Built by students, for students
            </span>
          </div>

          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="py-14 md:py-16">
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                A study planner that understands how school actually works.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
                Subjects, assessments, deadlines, and study sessions pile up
                fast. MyStudyPlanner keeps everything in one calm place — so you
                can focus on the work, not managing tools.
              </p>

              {/* Value badges (tight + consistent) */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Completely free
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1">
                  No ads
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1">
                  Calm UI · no fluff
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  Try the demo
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  Create account
                </Link>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Demo uses sample data · no account required
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                No clutter. No productivity theatre. Just what students need.
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <div className="text-sm font-semibold text-foreground">
                    Built for real student life
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Everything you need — nothing you don’t.
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/80" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          See your week clearly
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          One calendar for study + assessments, without the
                          “busy” feeling.
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/55" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Stay consistent (without burnout)
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Log sessions, stay focused day-to-day, and build
                          momentum.
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/35" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Marks + insights that actually help
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Track results, spot patterns early, and adjust before
                          it’s too late.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consistent footer area */}
                <div className="border-t border-border px-5 py-4">
                  <span className="inline-flex items-center rounded-full border border-border bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                    Built by students who were sick of overcomplicated planners.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MyStudyPlanner
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <Link
                href="/demo"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Demo
              </Link>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Sign in
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
