// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Stay organised as a student",
  description:
    "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  keywords: [
    "student planner",
    "study planner",
    "assessment tracker",
    "assignment planner",
    "homework planner",
    "study session tracker",
    "marks tracker",
    "school planner",
    "student organisation app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stay organised as a student",
    description:
      "Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.",
  },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </div>

          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <section className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-16 md:h-72 md:w-72" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center md:px-10 md:py-24">
            <h1 className="mx-auto max-w-[13ch] text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95]">
              Everything you need to stay organised as a student.
            </h1>

            <p className="mx-auto mt-4 max-w-[42rem] text-[15px] leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
              Organise assessments, assignments, homework, study sessions, and marks in one planner built for real student life.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try it now
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create account
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Free to explore. Opens with demo data. Create an account to save across devices.
            </p>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
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