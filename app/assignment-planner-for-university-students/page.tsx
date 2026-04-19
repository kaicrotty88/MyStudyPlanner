import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best assignment planner for university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best assignment planner for university students is one that helps you organise deadlines, study sessions, and progress across multiple units in one place. MyStudyPlanner is built for that kind of calm, simple semester planning.",
      },
    },
    {
      "@type": "Question",
      name: "How can university students plan assignments better?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "University students can plan assignments better by keeping due dates, smaller work stages, and study sessions together in one planner. This makes it easier to spread work across the semester and avoid leaving major tasks too late.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for managing uni assignment deadlines?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner helps uni students organise assignment deadlines, revision, subject workload, and study sessions in one place, which makes semester planning feel clearer and less scattered.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online assignment planner for uni?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise university assignments, due dates, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Assignment Planner for University Students | MyStudyPlanner";
  const description =
    "A calm assignment planner for university students. Organise uni deadlines, study sessions, and semester workload in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/assignment-planner-for-university-students",
    },
    openGraph: {
      title,
      description,
      url: "/assignment-planner-for-university-students",
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
    title: "Track multiple uni assignments",
    description:
      "Keep essays, reports, projects, quizzes, and presentations visible across all your units in one place.",
  },
  {
    title: "See deadlines earlier",
    description:
      "A clearer view of due dates helps you notice busy weeks before everything lands at once.",
  },
  {
    title: "Break work into manageable stages",
    description:
      "Plan research, drafting, editing, and revision with study sessions that fit your actual week.",
  },
  {
    title: "Reduce last minute rush",
    description:
      "A calmer assignment plan makes semester workload easier to handle without relying on memory alone.",
  },
];

export default function AssignmentPlannerForUniversityStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-assignment-planner-for-university-students"
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

        <p className="text-sm text-muted-foreground">For university assignments</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Assignment planner for university students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm assignment planner for university students
          who want one place to organise deadlines, study sessions, reminders,
          and subject workload. It helps uni students plan assignments more
          clearly across the semester without building a complicated system.
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
          Why university students need an assignment planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            University assignments often feel difficult not because of one task
            on its own, but because several different pieces of work start
            overlapping. You might have an essay due in one unit, a lab report
            in another, a group presentation coming up, and revision for a quiz
            all in the same fortnight. When those deadlines are spread across
            subject portals, notes apps, calendars, and memory, it becomes much
            harder to see the real shape of your semester.
          </p>
          <p>
            An assignment planner for university students helps by bringing
            those deadlines together. Instead of only knowing what is due next,
            you can start to see what needs early progress, which weeks look
            overloaded, and where you still have time to work ahead. That kind
            of clarity matters when uni assessments are often larger, more
            independent, and easier to leave too late than school tasks.
          </p>
          <p>
            MyStudyPlanner is built around that practical need. It is not trying
            to turn study into a giant productivity project. It is simply a
            calmer way to organise semester work so you can focus on the
            assignments themselves. If you are also comparing broader options, a{" "}
            <Link
              href="/study-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for university students
            </Link>{" "}
            can give you the bigger semester view beyond assignments alone.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What uni students usually need to plan for assignments
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful uni assignment planner needs to do more than list due
            dates. Most students also need to know which unit a task belongs to,
            how large it is, whether it needs research or drafting time, and how
            it fits alongside other work that week. A due date on its own does
            not always show how much pressure is building around it.
          </p>
          <p>
            For example, a 2000 word essay due in two weeks is not the same as a
            short weekly quiz due tomorrow, even though both are technically
            assignments. A better planner helps you think in terms of workload
            rather than just dates. That makes it easier to spread work across
            the semester instead of reaching the final few days and realising
            there is much more left to do than expected.
          </p>
          <p>
            MyStudyPlanner helps keep that context visible by letting you manage
            assignments as part of your overall study routine. You can add
            deadlines, plan study sessions, and keep subjects organised together
            in one place. If you want a broader deadline-focused page, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page covers that use case too.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background/60 p-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {item.title}
                </div>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          How MyStudyPlanner helps you plan uni assignments better
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is designed to help university students work ahead in
            a realistic way. You can add your units, enter assignment deadlines,
            and use study sessions to prepare before due dates get too close.
            That means your planner is not only showing what is due, but also
            supporting how the work gets done over time.
          </p>
          <p>
            This matters because uni assignments usually involve stages. You may
            need to choose a topic, gather readings, make notes, draft, edit,
            reference properly, and proofread. When those steps are not visible,
            it is easy to underestimate the time needed and leave too much to
            the final stretch. A planner helps turn one large task into a more
            manageable sequence.
          </p>
          <p>
            MyStudyPlanner also works well for students who want something they
            can update quickly. If a planning system feels too detailed or too
            demanding, it often gets abandoned right when semester is busiest. A
            calmer layout makes it easier to come back, check what matters, and
            keep moving.
          </p>
          <p>
            Because it runs in the browser, it also works well as an{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>{" "}
            for students who want their uni planning accessible from anywhere.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A calmer alternative to generic task apps
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Many university students begin with a general to do list app,
            calendar, or notes system. Those tools can be useful, but they are
            often built for work tasks rather than semester planning. They may
            show you a deadline, but they do not always fit naturally with
            subjects, revision, assignment stages, or marks across the term.
          </p>
          <p>
            MyStudyPlanner is made specifically for student life. Assignments,
            study sessions, reminders, exams, and marks are all part of the
            same flow. You do not need to force a work-style productivity tool
            into something that only partly suits university study. That can
            make a big difference when your routine already feels full.
          </p>
          <p>
            If exam preparation tends to overlap with assignment deadlines for
            you, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page explains how to manage revision alongside coursework. If you
            also want to monitor how each unit is going over time, the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page is relevant too.
          </p>
          <p>
            The goal is not to make study feel more intense. The goal is to make
            your assignment workload easier to understand and easier to act on.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for Australian uni students who want less clutter
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner suits Australian university students who want a more
            straightforward way to organise semester assessments. Uni life often
            includes classes, commute time, part time work, and personal
            commitments on top of study. In that kind of routine, a planner
            needs to be simple enough to check quickly and useful enough to keep
            trusting during busy weeks.
          </p>
          <p>
            That is why the layout stays calm. There are no streaks, badges, or
            lots of visual extras trying to compete for your attention. The
            point is to help you see upcoming assignments, understand your
            workload, and plan your time with a bit more confidence.
          </p>
          <p>
            You can start with a free account and use the planner for real
            semester work before deciding whether premium features are worth it.
            That makes it easier to test the routine properly rather than
            guessing from screenshots alone.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The demo is the easiest way to see whether MyStudyPlanner fits how
            you work. It shows the real planner with sample data, so you can
            click through the dashboard, calendar, tasks, study log, marks,
            reminders, and settings before creating an account.
          </p>
          <p>
            Then if it feels right, you can start with a free account and add
            your own units and deadlines. You do not need a perfect setup on day
            one. Even entering a few real assignments can make the next week
            feel more manageable.
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
              What is the best assignment planner for university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best assignment planner for university students is one that
              helps you organise deadlines, study sessions, and progress across
              multiple units in one place. MyStudyPlanner is built for students
              who want that kind of calm, simple semester planning.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can university students plan assignments better?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              University students can plan assignments better by keeping due
              dates, smaller work stages, and study sessions together in one
              planner. That makes it easier to spread work across the semester
              and avoid leaving major tasks too late.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for managing uni assignment deadlines?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner helps uni students organise assignment
              deadlines, revision, subject workload, and study sessions in one
              place, which makes semester planning feel clearer and less
              scattered.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online assignment planner for
              uni?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise university assignments, due dates, and study
              sessions before deciding whether you want premium features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}