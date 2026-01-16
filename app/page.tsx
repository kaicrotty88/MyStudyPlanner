import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm, minimal study planner for high-school students. Plan tasks, schedule study sessions, and stay focused — without the clutter.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MyStudyPlanner",
    description:
      "A calm, minimal study planner for high-school students. Plan tasks, schedule study sessions, and stay focused — without the clutter.",
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
            <span className="text-[11px] text-muted-foreground">
              Made by students, for students
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-95 transition"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            {/* Left */}
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                Calm • Focused • Minimal
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Study planning that feels effortless.
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                MyStudyPlanner helps you organise tasks, schedule study sessions, and stay on top of
                deadlines — with a premium, distraction-free UI built for high-school students.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  Try demo
                </Link>

                <Link
                  href="/sign-in"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  Sign in / Create account
                </Link>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                No clutter. No noise. Just a clean system you’ll actually stick to.
              </p>
            </div>

            {/* Right – app snapshot */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-5 py-4">
                  <div className="text-sm font-semibold text-foreground">Today</div>
                  <div className="text-xs text-muted-foreground">
                    A quick snapshot of what matters.
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">Next up</div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      Mathematics — Chapter review
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      60 min • 4:00 PM
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="text-xs text-muted-foreground">Due soon</div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      Chemistry — Lab report draft
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">This week</div>
                  </div>
                </div>
              </div>
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
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition">
                Sign in
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
