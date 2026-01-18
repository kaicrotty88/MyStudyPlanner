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
        <section className="py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-6">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Study planning that feels effortless.
              </h1>

              <p className="mt-3 max-w-lg text-base text-muted-foreground md:text-lg">
                A calm planner for high-school — tasks, study sessions, and deadlines in one place.
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
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  Create account
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No clutter. No noise. Just a system you’ll actually use.
              </p>
            </div>

            {/* Right – compact feature map */}
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Everything included
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Dashboard</div>
                    <div className="text-xs text-muted-foreground">Today & next</div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Calendar</div>
                    <div className="text-xs text-muted-foreground">Week & month</div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Tasks</div>
                    <div className="text-xs text-muted-foreground">Assignments</div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Study Planner</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Insights</div>
                    <div className="text-xs text-muted-foreground">Patterns</div>
                  </div>

                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Marks</div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>

                  <div className="col-span-2 rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="font-medium text-foreground">Reminders</div>
                    <div className="text-xs text-muted-foreground">
                      Stay on track
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
