import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm, minimal study planner for high-school students. Tasks, study sessions, and deadlines — without the clutter.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MyStudyPlanner",
    description:
      "A calm, minimal study planner for high-school students. Tasks, study sessions, and deadlines — without the clutter.",
    url: "https://mystudyplanner.co/",
    type: "website",
  },
};

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Made by students, for students</span>
          </div>

          <nav className="flex items-center">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-12 md:items-center">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Study planning that feels effortless.
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                A calm planner for high-school — tasks, study sessions, and deadlines in one place.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
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

                <Link
                  href="/sign-in"
                  className="ml-1 inline-flex h-11 items-center justify-center rounded-xl px-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-7 text-sm text-muted-foreground">
                No clutter. No noise. Just a clean system you’ll actually stick to.
              </p>
            </div>

            {/* Right – app snapshot */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                {/* “window” header to feel more real/premium */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">Preview</span>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Today</div>
                      <div className="text-xs text-muted-foreground">
                        A quick snapshot of what matters.
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <span className="rounded-full border border-border bg-card/60 px-2 py-1 text-[11px] text-muted-foreground">
                        Dashboard
                      </span>
                      <span className="rounded-full border border-border bg-card/60 px-2 py-1 text-[11px] text-muted-foreground">
                        Calendar
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Next up</div>
                        <span className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                          Study session
                        </span>
                      </div>

                      <div className="mt-2 flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/80" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            Mathematics — Chapter review
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-border bg-card/60 px-2 py-0.5">
                              60 min
                            </span>
                            <span className="rounded-full border border-border bg-card/60 px-2 py-0.5">
                              4:00 PM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Due soon</div>
                        <span className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                          Task
                        </span>
                      </div>

                      <div className="mt-2 flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            Chemistry — Lab report draft
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-border bg-card/60 px-2 py-0.5">
                              This week
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span>Clean. Calm. Focused.</span>
                      <span className="rounded-full border border-border bg-card/60 px-2 py-1 text-[11px]">
                        View more →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Tip: try the demo first — then create an account if you want to save your setup.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MyStudyPlanner
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/demo" className="text-muted-foreground hover:text-foreground transition">
                Demo
              </Link>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
