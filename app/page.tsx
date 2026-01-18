import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm study planner for high school and university students. Plan your study, track assessments, manage deadlines, and stay on top of your workload.",
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
        <section className="py-14 md:py-18">
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                A study planner that understands how school actually works.
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                You’re juggling subjects, assessments, deadlines, and study
                sessions — usually across random notes, apps, and tabs.
                MyStudyPlanner brings it together so you can focus on the work,
                not managing it.
              </p>

              {/* Student reality / anchor */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                Built for high school + uni • calm by design • no fluff
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
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

              {/* Trust + clarity row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <span>Demo uses sample data</span>
                <span className="hidden sm:inline">•</span>
                <span>No account required</span>
                <span className="hidden sm:inline">•</span>
                <span>Local-only by default</span>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No clutter. No productivity theatre. Just what students need.
              </p>
            </div>

            {/* Right – outcomes card */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card/60 shadow-sm">
                <div className="border-b border-border px-5 py-4">
                  <div className="text-sm font-semibold text-foreground">
                    What it helps with
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Planning, tasks, study sessions, marks, and insights — in one
                    calm system.
                  </div>
                </div>

                <div className="divide-y divide-border">
                  <div className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">
                      See exactly what you need to do this week
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Plan study sessions, assessments, and deadlines in one
                      clear calendar — without everything feeling “busy”.
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">
                      Stop guessing if you’re doing enough study
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Log sessions, stay focused day-to-day, and build
                      consistency without overplanning or burnout.
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">
                      Understand what’s actually working
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Track marks and insights so you can see how effort turns
                      into results — and adjust early.
                    </div>
                  </div>

                  <div className="px-5 py-4 text-sm text-muted-foreground">
                    Built by students who wanted a planner that matched real
                    school life — not how productivity blogs say it should work.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
