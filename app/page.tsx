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
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">MyStudyPlanner</span>
              <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
            </div>
          </div>

          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="relative py-12 md:py-14">
          {/* Soft backdrop (keeps it premium without “screenshots”) */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-muted/40 blur-3xl" />
            <div className="absolute left-1/3 top-[-140px] h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.03]">
                A study planner that understands how school actually works.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
                Subjects, assessments, deadlines, and study sessions pile up fast. MyStudyPlanner keeps everything in one
                calm place — so you focus on the work, not managing tools.
              </p>

              {/* Badges (clean + consistent) */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card/60 px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Completely free
                </span>
                <span className="inline-flex h-8 items-center rounded-full border border-border bg-card/60 px-3">
                  No ads
                </span>
                <span className="inline-flex h-8 items-center rounded-full border border-border bg-card/60 px-3">
                  Calm UI · no fluff
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
                >
                  Try the demo
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60 transition"
                >
                  Create account
                </Link>
              </div>

              {/* One calm line (less “writing”, still high trust) */}
              <div className="mt-3 text-xs text-muted-foreground">
                Demo uses sample data · no account required · local-only by default
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                No clutter. No productivity theatre. Just what students need.
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">Built for real student life</div>
                    <span className="inline-flex h-7 items-center rounded-full border border-border bg-card/60 px-2 text-[11px] text-muted-foreground">
                      Features
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Everything you need — nothing you don’t.</div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/80" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">See your week clearly</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          One calendar for study + assessments, without the “busy” feeling.
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/55" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">Stay consistent (without burnout)</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Log sessions, stay focused day-to-day, and build momentum.
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    <div className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/35" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">Marks + insights that actually help</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Track results, spot patterns early, and adjust before it’s too late.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer chip */}
                <div className="border-t border-border px-5 py-4">
                  <span className="inline-flex h-8 items-center rounded-full border border-border bg-muted/20 px-3 text-xs text-muted-foreground">
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
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyStudyPlanner</div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <Link href="/demo" className="text-muted-foreground hover:text-foreground transition">
                Demo
              </Link>
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition">
                Sign in
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
