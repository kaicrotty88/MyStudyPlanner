import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheckBig,
  ListChecks,
  Sparkles,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";

const faq = [
  {
    question: "Is MyStudyPlanner free?",
    answer:
      "Yes. Calendar, Tasks and Study are available on the Free plan. Premium adds Marks and deeper performance insights.",
  },
  {
    question: "How does study planning work?",
    answer:
      "Add an assignment or exam, choose the days you want to prepare, then open Study when you are ready to work. Exact times are optional.",
  },
  {
    question: "Can I use it for both school and university?",
    answer:
      "Yes. MyStudyPlanner supports subjects, assignments, exams, homework, personal tasks, timetables and study sessions for both high school and university workflows.",
  },
  {
    question: "Can I import Google Calendar?",
    answer:
      "Yes. Google Calendar import is optional and uses read-only calendar access so you can bring selected events into your planner.",
  },
] as const;

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyStudyPlanner",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: "https://mystudyplanner.co",
  description:
    "A student planner that connects assessments, Calendar, study preparation and results.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Premium Monthly", price: "2.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Premium Yearly", price: "19.99", priceCurrency: "USD" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export const metadata: Metadata = {
  title: "MyStudyPlanner | A Calm Student Planner for Calendar, Tasks and Study",
  description:
    "Add assessments, plan study days, focus on what to do next and connect preparation to results in one calm student planner.",
  alternates: { canonical: "/" },
};

function ProductCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_70px_rgba(37,40,36,0.10)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Calendar</div>
          <div className="text-xs text-muted-foreground">Wednesday 23 September</div>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">Add item</span>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Upcoming</div>
          <div className="mt-4 space-y-3">
            {[
              ["Motion topic test", "Physics · Exam · 30 Sep"],
              ["Practical report draft", "Chemistry · Assignment · 2 Oct"],
              ["Calculus worksheet", "Mathematics · 24 Sep"],
            ].map(([title, meta]) => (
              <div key={title} className="rounded-2xl border border-border bg-background/70 p-3.5">
                <div className="text-sm font-semibold text-foreground">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Study Focus</div>
          <div className="mt-4 rounded-2xl border border-border bg-primary-softer p-4">
            <div className="text-xs font-medium text-primary">Recommended next</div>
            <div className="mt-2 text-base font-semibold text-foreground">Motion topic test</div>
            <div className="mt-1 text-xs text-muted-foreground">1h of 3h prepared</div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
            <div className="mt-4 inline-flex rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground">Start studying</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script id="software-application-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 md:px-10">
          <Link href="/" className="leading-tight" aria-label="MyStudyPlanner home">
            <div className="text-base font-semibold tracking-tight">MyStudyPlanner</div>
            <div className="text-[11px] text-muted-foreground">A calmer way to plan study</div>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <a href="#how-it-works" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex">How it works</a>
            <a href="#pricing" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground md:inline-flex">Pricing</a>
            <Link href="/sign-in" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60">Sign in</Link>
            <Link href="/sign-up" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Get started</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 md:px-10 md:py-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Calendar first. Study connected.
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[4rem] xl:text-7xl">
              Add the work once. Keep the whole study process connected.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              MyStudyPlanner connects assessments, Calendar, study days, focused sessions and results without turning your week into a complicated scheduling system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/demo" className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/60">Try the live demo</Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Free plan available. No payment card required to create a free account.</p>
          </div>
          <ProductCard />
        </section>

        <section id="how-it-works" className="border-y border-border bg-card/60">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">One connected workflow</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">From deadline to preparation to result.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">Each part of the app has one job, and each one hands you naturally to the next.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                [CalendarDays, "1. Add", "Add an exam, assignment or personal task with only the fields it actually needs."],
                [ListChecks, "2. Plan", "See it on Calendar and choose the days you want to prepare. Exact time is optional."],
                [TimerReset, "3. Study", "Open Study, see a recommended next assessment and start a linked focus session."],
                [TrendingUp, "4. Result", "Record the result in Marks and keep preparation and performance connected."],
              ].map(([Icon, title, body]) => {
                const Component = Icon as typeof CalendarDays;
                return (
                  <article key={String(title)} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary"><Component className="h-4 w-4" /></div>
                    <h3 className="mt-5 text-base font-semibold">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(body)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ["Calendar is the base", "Deadlines, classes and planned study live in one calm calendar. Day-level planning is the default."],
              ["Study tells you what to do next", "Recommended next keeps one assessment prominent while the rest stay available without competing for attention."],
              ["Marks closes the loop", "Premium connects preparation time, assessment results, subject averages and trends without changing the core free workflow."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <CircleCheckBig className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-y border-border bg-card/60">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
            <div className="text-center">
              <p className="text-sm font-medium text-primary">Simple pricing</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Use the planner free. Upgrade for results and deeper insight.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground">Free</div>
                <div className="mt-2 text-4xl font-semibold">$0</div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {["Calendar and timetable", "Tasks and assessments", "Study planning and timer", "Google Calendar import"].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}
                </ul>
                <Link href="/sign-up" className="mt-7 inline-flex rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Create free account</Link>
              </div>
              <div className="rounded-3xl border border-primary/25 bg-primary-softer p-7 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-primary">Premium</div>
                  <span className="rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground">Yearly saves vs monthly</span>
                </div>
                <div className="mt-2 text-3xl font-semibold">$2.99 <span className="text-base font-medium text-muted-foreground">USD/month</span></div>
                <div className="mt-1 text-sm text-muted-foreground">or $19.99 USD/year</div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {["Everything in Free", "Marks and subject performance", "Preparation-to-result context", "Deeper study insights"].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}
                </ul>
                <p className="mt-6 text-xs leading-5 text-muted-foreground">Subscriptions renew automatically at the selected monthly or yearly interval until cancelled. Manage or cancel from the Premium page.</p>
                <Link href="/sign-up" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Start with Free</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 md:px-10 md:py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Questions students usually ask</h2>
          <div className="mt-8 space-y-3">
            {faq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-border bg-card p-5 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground focus-visible:outline-none">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold">MyStudyPlanner</div>
            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">A student planner for organising schoolwork, planning preparation and keeping study connected to results.</p>
            <p className="mt-2 text-xs text-muted-foreground">Contact: <a className="underline underline-offset-2 hover:text-foreground" href="mailto:mystudyplanner.studio@gmail.com">mystudyplanner.studio@gmail.com</a></p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/refund" className="hover:text-foreground">Refunds</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
            <CookiePreferencesButton className="hover:text-foreground" />
          </nav>
        </div>
      </footer>
    </div>
  );
}
