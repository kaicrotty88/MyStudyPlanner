// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "MyStudyPlanner | Calm Online Study Planner for Students",
  description:
    "MyStudyPlanner is a calm online study planner for high school and university students. Organise subjects, track assessments, plan study sessions, and stay on top of deadlines without clutter.",
  keywords: [
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
    title: "MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "Organise subjects, track assessments, plan study sessions, and stay on top of deadlines in one calm place.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyStudyPlanner | Calm Online Study Planner for Students",
    description:
      "A calm online study planner for high school and university students.",
  },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  const testimonials = [
    {
      quote:
        "This is the first planner that doesn’t make me feel behind the second I open it.",
      name: "Year 12 student",
    },
    {
      quote:
        "I can actually see my week clearly without 15 widgets fighting for attention.",
      name: "University student",
    },
    {
      quote:
        "It feels calm, simple, and actually built for how students work.",
      name: "High school student",
    },
    {
      quote:
        "Logging study is quick enough that I actually keep doing it.",
      name: "First-year uni student",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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

      <main className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="relative py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-muted/35 blur-3xl" />
          </div>

          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7 text-center md:text-left">
              <div className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                Calm planning for real student life
              </div>

              <h1 className="mx-auto mt-4 max-w-[13ch] text-4xl font-semibold tracking-tight text-foreground md:mx-0 md:text-6xl md:leading-[1.03]">
                Stay on top of school without the clutter.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground md:mx-0 md:text-lg md:leading-8">
                MyStudyPlanner helps students organise subjects, track assessments, and log study sessions in one calm
                place.
              </p>

              <div className="mt-7 grid w-full max-w-md grid-cols-1 gap-3 sm:mx-auto sm:grid-cols-2 md:mx-0">
                <Link
                  href="/demo"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Try it now
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
                >
                  Create account
                </Link>
              </div>

              <div className="mx-auto mt-3 max-w-md text-[11px] text-muted-foreground opacity-80 md:mx-0">
                Free to explore. Opens with demo data. Create an account to save across devices.
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-5 py-4">
                  <div className="text-sm font-semibold text-foreground">Why students like it</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Clean, practical, and easy to keep using.
                  </div>
                </div>

                <div className="space-y-5 px-5 py-4">
                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">See your week clearly</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        One place for subjects, study, and assessments.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Stay consistent</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Log study sessions quickly without overplanning.
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Spot patterns early</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Track workload and progress before things pile up.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
                  Built by students who were sick of overcomplicated planners.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12 md:pb-16">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">What students say</div>
              <p className="mt-1 text-sm text-muted-foreground">
                A calmer kind of planner.
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />

              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                {[...testimonials, ...testimonials].map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="min-w-[280px] max-w-[280px] snap-start rounded-2xl border border-border bg-card p-5 shadow-sm md:min-w-[320px] md:max-w-[320px]"
                  >
                    <p className="text-sm leading-6 text-foreground">“{item.quote}”</p>
                    <div className="mt-4 text-xs text-muted-foreground">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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