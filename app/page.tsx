// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner — Free Online Study Planner for Students",
  description:
    "A calm online study planner for high school and university students. Organise subjects, assessments, deadlines, and study sessions — with optional save & sync across devices.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MyStudyPlanner — Free Online Study Planner",
    description:
      "A calm online study planner for students. Organise subjects, assessments, deadlines, and study sessions — with optional save & sync across devices.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MyStudyPlanner — Free Online Study Planner",
    description:
      "A calm online study planner for students. Organise subjects, assessments, deadlines, and study sessions — with optional save & sync across devices.",
  },
  keywords: [
    "study planner",
    "online study planner",
    "student planner",
    "homework planner",
    "assessment tracker",
    "study log",
    "school planner",
    "university planner",
    "study timetable",
  ],
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MyStudyPlanner",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    description:
      "A calm online study planner for high school and university students. Organise subjects, assessments, deadlines, and study sessions — with optional save & sync across devices.",
  };

  return (
    <div className="min-h-screen bg-background">
      <Script
        id="msp-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
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
          {/* Soft backdrop */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-muted/35 blur-3xl" />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            {/* Left */}
            <div className="md:col-span-7">
              <h1 className="max-w-[17ch] text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.03]">
                A study planner that understands how school actually works.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
                Subjects, assessments, deadlines, and study sessions pile up fast. MyStudyPlanner keeps everything in one
                calm place – so you focus on the work, not managing tools. A free online study planner for high school
                and university students.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/demo"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition"
                  aria-label="Try it now with sample data"
                >
                  Try it now
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary border border-primary/20">
                    Sample data
                  </span>
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/60 transition"
                  aria-label="Create a free account"
                >
                  Create account
                </Link>
              </div>

              <div className="mt-3 text-[11px] text-muted-foreground opacity-80">
                Opens with sample data. Create an account to save and sync across devices.
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <div className="text-sm font-semibold text-foreground">Built for real student life</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Compact, calm, and designed around how school actually runs.
                  </div>
                </div>

                <div className="px-5 py-4 space-y-5">
                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">See your week clearly</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        One place for study and assessments, without the busy feeling.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Stay consistent</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Log sessions and build momentum, without overplanning.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Marks and insights</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Track results, spot patterns early, and adjust before it is too late.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-border text-xs text-muted-foreground">
                  Built by students who were sick of overcomplicated planners.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyStudyPlanner</div>

            <div className="flex items-center gap-4 text-xs">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
                About
              </Link>
              <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition">
                How it works
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