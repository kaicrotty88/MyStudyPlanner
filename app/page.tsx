import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm, minimal study planner for high-school students. Tasks, study sessions, calendars, and reminders — without the clutter.",
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
              Made by students, for students
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
        <section className="py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-12">
            {/* Primary message */}
            <div className="md:col-span-7">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[3.5rem] md:leading-[1.04]">
                Study planning,
                <br />
                without the friction.
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                A calm system for high-school students to manage tasks, plan
                study sessions, and see everything clearly — without overwhelm.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  Try the demo
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  Create account
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No clutter. No noise. Just a system you’ll actually use.
              </p>
            </div>

            {/* System map */}
            <div className="md:col-span-5 md:pt-2">
              <div className="space-y-8">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  The system
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Dashboard
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Today’s focus and what’s next
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Calendar
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Week & month planning
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Tasks
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assignments & exams
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Study Planner
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Log study sessions
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Reminders
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stay on track
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Insights
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Build consistency
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Marks
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Track progress
                      </div>
                    </div>
                  </div>
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
