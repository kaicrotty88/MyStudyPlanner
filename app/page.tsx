// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "MyStudyPlanner | Student Study Planner",
  description:
    "MyStudyPlanner helps students organise subjects, track assessments, plan study sessions, and stay on top of school in one place.",
  keywords: [
    "student study planner",
    "online study planner",
    "study planner for students",
    "high school study planner",
    "university study planner",
    "student planner",
    "assessment planner",
    "study session tracker",
    "assignment planner",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MyStudyPlanner | Student Study Planner",
    description:
      "Organise subjects, track assessments, plan study sessions, and stay on top of school in one place.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyStudyPlanner | Student Study Planner",
    description:
      "A study planner that helps students organise school, assessments, and study sessions in one place.",
  },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  const testimonials = [
    {
      quote: "This is the first planner that doesn’t make me feel behind the second I open it.",
      name: "Year 12 student",
    },
    {
      quote: "I can actually see my week clearly without 15 widgets fighting for attention.",
      name: "University student",
    },
    {
      quote: "It feels simple and actually built for how students work.",
      name: "High school student",
    },
    {
      quote: "Logging study is quick enough that I actually keep doing it.",
      name: "First-year uni student",
    },
  ];

  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes testimonials-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">MyStudyPlanner</span>
            <span className="text-[11px] text-muted-foreground">Built by students, for students</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground md:inline-flex"
            >
              About
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-16 md:h-72 md:w-72" />
          </div>

          <div className="mx-auto max-w-3xl px-6 pb-10 pt-12 text-center md:px-10 md:pb-14 md:pt-16">
            <h1 className="mx-auto max-w-[11ch] text-5xl font-semibold tracking-tight text-foreground md:text-7xl md:leading-[0.95]">
              Study planning that actually makes sense.
            </h1>

            <p className="mx-auto mt-4 max-w-[38rem] text-[15px] leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
              Organise subjects, keep up with assessments, and log study sessions in one place built for students.
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

        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <div className="mb-6 text-center">
              <div className="text-sm font-semibold text-foreground">What students say</div>
              <p className="mt-1 text-sm text-muted-foreground">A planner that feels easier to keep up with.</p>
            </div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

              <div
                className="flex w-max gap-4"
                style={{
                  animation: "testimonials-marquee 32s linear infinite",
                }}
              >
                {marqueeItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex min-h-[170px] w-[300px] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm md:w-[340px]"
                  >
                    <p className="text-base leading-7 text-foreground">“{item.quote}”</p>
                    <div className="mt-6 text-sm text-muted-foreground">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 md:px-10 sm:flex-row sm:items-center sm:justify-between">
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