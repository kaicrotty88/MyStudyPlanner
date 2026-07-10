import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How far in advance should I start planning for an exam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There's no universal answer, but spacing revision across two to four weeks before an exam is generally more effective than concentrating it in the final few days, since it gives your memory more chances to reinforce the material over time.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track revision for more than one exam at the same time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If you have exams in different subjects in the same period, you can log and view study sessions separately for each one, so you can see whether your time is actually split the way you intended.",
      },
    },
    {
      "@type": "Question",
      name: "Does logging study sessions replace an actual study plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not on its own — logging shows you where your time went. Pairing that with your timetable to find realistic free periods is what turns it into an actual plan rather than a record after the fact.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Exam Planner for Students | MyStudyPlanner";
  const description =
    "An exam planner that helps students space revision across the weeks before exam day instead of cramming at the last minute.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/exam-planner",
    },
    openGraph: {
      title,
      description,
      url: "/exam-planner",
      siteName: "MyStudyPlanner",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const benefits = [
  {
    title: "Study sessions link back to the exam",
    description:
      "Every revision session you log can be tied to the specific exam it's for, so your prep time is never scattered across separate notes or apps.",
  },
  {
    title: "See your revision total before exam day, not after",
    description:
      "Rather than finding out in hindsight how much you studied, you can check your logged hours for a subject at any point in the lead-up and adjust if it's falling short.",
  },
  {
    title: "Exams sit on the same calendar as everything else",
    description:
      "No separate \"exam mode\" — your exam date shows up alongside your classes and homework, so you can see at a glance which weeks are already busy before you commit to a revision schedule.",
  },
];

export default function ExamPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-exam-planner"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="max-w-3xl space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <p className="text-sm text-muted-foreground">For revision planning</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Exam planner that spaces your revision instead of cramming it into the
          last week
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Exams are different from homework. There's no nightly deadline — just
          a date weeks away that's easy to ignore until it isn't. The problem
          with most planners is they treat an exam like any other due item: one
          entry on one day. An exam planner should instead help you spread
          revision across the weeks before it, so you're not trying to learn a
          whole subject in the final 48 hours.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Create free account
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Try demo first
          </Link>
        </div>
      </header>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Revision should build before exam week
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Say you have a Physics exam in three weeks. Instead of one entry on
            exam day, MyStudyPlanner lets you log study sessions in the weeks
            leading up to it — a 45-minute Physics revision block most Tuesdays,
            growing longer as the date gets closer — each one linked back to the
            exam itself. When exam day arrives, you can look back and see
            exactly how many hours you actually put in, not just guess.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Built for revision scheduling
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background/60 p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The demo is the easiest way to see how MyStudyPlanner handles exam
            planning with real calendar context. You can click through sample
            subjects, exam dates, study sessions, marks, reminders, and settings
            before creating an account.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Try demo first
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Create free account
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Frequently asked questions
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How far in advance should I start planning for an exam?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              There's no universal answer, but spacing revision across two to
              four weeks before an exam is generally more effective than
              concentrating it in the final few days, since it gives your memory
              more chances to reinforce the material over time.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I track revision for more than one exam at the same time?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. If you have exams in different subjects in the same period,
              you can log and view study sessions separately for each one, so
              you can see whether your time is actually split the way you
              intended.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Does logging study sessions replace an actual study plan?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Not on its own — logging shows you where your time went. Pairing
              that with your timetable to find realistic free periods is what
              turns it into an actual plan rather than a record after the fact.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}