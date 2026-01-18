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
        <section className="py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                A study planner that actually understands school.
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                MyStudyPlanner is built for high school and university students
                to plan their study, organise assessments, manage deadlines,
                and keep everything in one calm place.
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
                No clutter. No productivity theatre. Just what students need.
              </p>
            </div>

            {/* Right – clear capability overview */}
            <div className="md:col-span-5">
              <div className="space-y-8">
                {/* Planning */}
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Plan your workload
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Use the calendar to plan study sessions, see your week,
                    and organise assessments and deadlines.
                  </div>
                </div>

                {/* Study */}
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Study with intention
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Log study sessions, stay focused day-to-day, and build
                    consistent habits without overplanning.
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Track progress over time
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Record marks, review insights, and understand how your
                    effort translates into results.
                  </div>
                </div>

                {/* Credibility */}
                <div className="pt-4 text-sm text-muted-foreground">
                  Built by students who were frustrated with existing planners
                  and wanted something calmer, simpler, and actually useful.
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
