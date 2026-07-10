import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is a homework planner different from a to-do list app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A to-do list treats every task the same. A homework planner that's built for school understands that homework belongs to a subject, has a due date and often a specific class it was assigned in — and ideally sits next to your actual timetable so you can see when you'll realistically do it, not just that it's due soon.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see all my homework for one subject at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can filter by subject to see everything outstanding for just Chemistry, or just English, which is useful before a parent-teacher conference or when you're trying to figure out which subject is piling up.",
      },
    },
    {
      "@type": "Question",
      name: "What if I have homework with no fixed due date, like ongoing revision?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can add it without a due date and it'll sit as an open task until you mark it done, rather than being forced into a date that doesn't really apply.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Homework Planner for Students | MyStudyPlanner";
  const description =
    "A homework planner for students juggling work across multiple subjects. Organise homework by subject, night, due date, and timetable.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/homework-planner-for-students",
    },
    openGraph: {
      title,
      description,
      url: "/homework-planner-for-students",
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
    title: "Sorted by subject, not just by date",
    description:
      "Each subject keeps its own colour, so a glance at tonight tells you what's Maths and what's English without reading every title.",
  },
  {
    title: "Homework sits next to your actual timetable",
    description:
      "Because your recurring classes are already on the calendar, you can see which nights are lighter and which are already full of class prep — not just a flat to-do list with no sense of your week.",
  },
  {
    title: "Nothing disappears once it's not due \"soon\"",
    description:
      "A worksheet due in 10 days doesn't vanish from view the way it can in a plain notes app — it's sitting on the date you assigned it, visible whenever you get to that day.",
  },
];

export default function HomeworkPlannerForStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-homework-planner-for-students"
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

        <p className="text-sm text-muted-foreground">For the nightly grind</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Homework planner for students who have five subjects due the same week
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Homework rarely arrives one subject at a time. You get a Maths
          worksheet Monday, a History reading Tuesday, and by Thursday you're
          trying to remember whether the Chemistry prac report was due Friday or
          next Friday. A homework planner only works if it can hold all of that
          at once, sorted by subject and by night, without you having to
          mentally re-sort it yourself every evening.
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
          A real homework week, not a perfect to-do list
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Say your Tuesday looks like this: a Maths worksheet due Wednesday
            morning, an English reading response due Thursday, and a Chemistry
            prac report due Friday at 4:30pm. In MyStudyPlanner, all three sit
            on your calendar on the night you'd actually work on them — not just
            listed by due date, but positioned against your real timetable, so
            you can see you have a free period Wednesday afternoon that's a
            natural slot for the Chemistry report.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Built for homework across subjects
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
            The demo is the easiest way to see how MyStudyPlanner handles real
            student workload. You can click through the planner with sample
            subjects, homework, study sessions, reminders, and calendar entries
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
              How is a homework planner different from a to-do list app?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              A to-do list treats every task the same. A homework planner that's
              built for school understands that homework belongs to a subject,
              has a due date and often a specific class it was assigned in — and
              ideally sits next to your actual timetable so you can see when
              you'll realistically do it, not just that it's "due soon."
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I see all my homework for one subject at once?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can filter by subject to see everything outstanding for
              just Chemistry, or just English, which is useful before a
              parent-teacher conference or when you're trying to figure out
              which subject is piling up.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              What if I have homework with no fixed due date, like ongoing
              revision?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              You can add it without a due date and it'll sit as an open task
              until you mark it done, rather than being forced into a date that
              doesn't really apply.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}