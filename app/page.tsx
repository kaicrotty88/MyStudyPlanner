import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm, minimal study planner for high-school students. Tasks, study sessions, calendars, and reminders — without the clutter.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MyStudyPlanner",
    description:
      "A calm, minimal study planner for high-school students. Tasks, study sessions, calendars, and reminders — without the clutter.",
    url: "https://mystudyplanner.co/",
    type: "website",
  },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              MyStudyPlanner
            </span>
            <span className="text-[11px] text-muted-foreground">
              Made by students, for students
            </span>
          </div>

          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="py-20 md:py-28">
          <div className="grid gap-16 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-6">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Study planning that feels effortless.
              </h1>

              <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
                A calm planner for high-school students — organise tasks, plan
                study sessions, and stay on top of school without overwhelm.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
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

              <p className="mt-8 text-sm text-muted-foreground">
                No clutter. No noise. Just a system you’ll actually use.
              </p>
            </div>

            {/* Right – full feature overview */}
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Everything you need
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Dashboard
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Today’s focus and what’s coming up
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Calendar
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Plan your days, weeks, and deadlines visually
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Tasks
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Track assignments, exams, and to-dos
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Study Planner
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Plan, log, and review study sessions
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Insights
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      See patterns and improve consistency
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Marks
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Track performance over time
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-sm font-medium text-foreground">
                      Reminders
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Stay on top of what matters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MyStudyPlanner
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/demo" className="text-muted-foreground hover:text-foreground">
                Demo
              </Link>
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
