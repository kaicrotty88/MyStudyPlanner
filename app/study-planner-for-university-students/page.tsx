import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best study planner for university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best study planner for university students is one that helps you manage assignments, exams, study sessions, and due dates in one place without adding extra complexity. MyStudyPlanner is designed for that kind of simple, calm planning.",
      },
    },
    {
      "@type": "Question",
      name: "How can university students organise assignments and exam dates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "University students can stay organised by keeping assignments, exam dates, weekly study sessions, and reminders together in one planner. This makes it easier to see workload across subjects and plan ahead before busy weeks.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for Australian university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner is built for students who want a straightforward way to manage semester work, including assignments, revision, marks, and weekly planning. It works well for Australian university students who want a calmer planner.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online study planner for uni?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise your university subjects, due dates, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Study Planner for University Students | MyStudyPlanner";
  const description =
    "A calm study planner for university students. Organise assignments, exams, study sessions, and marks in one simple place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/study-planner-for-university-students",
    },
    openGraph: {
      title,
      description,
      url: "/study-planner-for-university-students",
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
    title: "Keep each unit visible",
    description:
      "See your subjects, upcoming work, and study time in one place instead of splitting everything across different apps.",
  },
  {
    title: "Track assignment deadlines clearly",
    description:
      "Stay on top of essays, reports, quizzes, and projects before they all pile into the same week.",
  },
  {
    title: "Plan revision around real deadlines",
    description:
      "Use study sessions to prepare before exams and bigger assessments instead of leaving revision too late.",
  },
  {
    title: "Follow your marks over the semester",
    description:
      "Record results as they come back so you can spot which units need more attention.",
  },
];

export default function UniversityStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-study-planner-university-students"
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

        <p className="text-sm text-muted-foreground">For university students</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Study planner for university students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm study planner for university students who
          want one place to organise assignments, exams, study sessions,
          reminders, and marks. It is made for students who want to feel more
          clear about their semester without building a complicated system from
          scratch.
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
          Why university students need a proper study planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            University study can look manageable at the start of semester, then
            suddenly become hard to hold together. You might have lectures,
            tutorials, readings, quizzes, essays, lab reports, exams, and admin
            reminders all happening at once. A lot of students try to manage
            this with a mix of phone reminders, calendar events, notes apps, and
            memory. That usually works for a little while, but once classes get
            busy, everything ends up in different places.
          </p>
          <p>
            A study planner for university students helps because it brings the
            workload together. Instead of trying to remember what is due next,
            which subject needs more time, or whether you have already started
            revising for an exam, you can see the term more clearly. That makes
            it easier to plan your week calmly and make better decisions earlier.
          </p>
          <p>
            MyStudyPlanner is built around that idea. It is not trying to be a
            giant productivity system. It is a simple planner that helps uni
            students stay organised without turning planning into another task to
            keep up with. If you are also looking for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , this page shows how MyStudyPlanner fits university life
            specifically.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What university students usually need to keep track of
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful study planner for university students needs to do more than
            hold a few due dates. Real semester planning usually means keeping
            track of multiple units, assignment deadlines, revision sessions,
            exam dates, smaller weekly tasks, and the results that come back
            over time. When those things are spread across separate tools, it
            becomes harder to see the full picture.
          </p>
          <p>
            You might have an essay deadline in one calendar, a reading list in
            a notes app, an exam date in your subject outline, and reminders
            sitting in your phone. None of those tools really show how the
            workload fits together. That is where a proper university planner
            helps. It puts the semester in one place so you can tell what needs
            attention now and what can wait a little longer.
          </p>
          <p>
            If assignments are the main thing you are trying to stay on top of,
            the{" "}
            <Link
              href="/assignment-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment planner for university students
            </Link>{" "}
            page goes deeper into managing essays, reports, and longer
            assessment timelines. If you want a more general deadline view, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page is also useful.
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
          How MyStudyPlanner helps you stay organised during semester
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is designed to stay practical. You can add your
            subjects, enter assignments and exam dates, log study sessions, and
            keep reminders nearby without feeling like you are setting up a full
            operating system for your life. That matters at university because
            the pressure usually comes from combinations of deadlines rather than
            one giant task on its own.
          </p>
          <p>
            A lab report, class quiz, group project meeting, and revision for a
            mid-sem exam can all land in the same week. When that happens,
            clarity matters more than complexity. A calm planner helps you see
            what is due next, what needs early preparation, and where your time
            is actually going.
          </p>
          <p>
            MyStudyPlanner also works well if you prefer simple routines. You do
            not need to colour-code everything or build a detailed productivity
            system before it becomes useful. Add your units, put in the important
            dates, and start using it for real work. That is usually enough to
            make the week feel more manageable.
          </p>
          <p>
            Because it runs in the browser, it also works well as an{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>{" "}
            for students who want something accessible and easy to update.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A calmer way to manage assignments, revision, and marks
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Many uni students start with generic productivity apps. The problem
            is that those tools are often built for work projects, not student
            life. They can feel too broad, too cluttered, or too demanding to
            keep updated once semester becomes busy. When that happens, even a
            good-looking system becomes something you stop using.
          </p>
          <p>
            MyStudyPlanner stays focused on what students actually need.
            Assignments, exams, study sessions, reminders, and marks are already
            part of the workflow. You do not have to force a work-style project
            manager into something that fits university study. That makes it
            easier to return to the planner each day and trust what you see.
          </p>
          <p>
            If exam periods are where things tend to slip, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page explains how to plan revision in a calmer way. If you want to
            keep an eye on grades across the term, the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page covers that side of the planner too.
          </p>
          <p>
            The point is not to fill every hour of your week. The point is to
            make your workload feel clearer and easier to manage.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for Australian university students who want less clutter
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is especially suited to students who want a simple
            planner they can stick with during semester. For many Australian
            university students, that means juggling classes, commute time, part
            time work, and personal commitments alongside study. A planner needs
            to feel clear enough to open quickly and useful enough to keep coming
            back to.
          </p>
          <p>
            That is why the layout stays calm and focused. Instead of pushing
            badges, streaks, or lots of visual noise, the planner is designed to
            help you see what matters. When student life already feels busy, that
            kind of quieter structure can make planning feel more sustainable.
          </p>
          <p>
            You can start with a free account, use the planner for your real
            semester work, and then decide whether premium features are worth it
            for you later. That makes it easier to test the routine before fully
            committing.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The easiest way to see if MyStudyPlanner fits how you work is to try
            the demo first. The demo shows the real planner with sample data, so
            you can click through the dashboard, calendar, tasks, study log,
            marks, reminders, and settings. It gives you a clearer feel for the
            structure than a few screenshots ever could.
          </p>
          <p>
            Then if it feels right, you can create a free account and start with
            your own subjects and deadlines. You do not need a perfect setup to
            get value from it. Even entering a few real assignments and exam
            dates can make the week feel much clearer.
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
              What is the best study planner for university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best study planner for university students is one that helps
              you manage assignments, exams, study sessions, and due dates in
              one place without adding extra complexity. MyStudyPlanner is built
              for students who want a planner that feels clear, simple, and easy
              to keep using through the semester.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can university students organise assignments and exam dates?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The simplest way is to keep assignments, exam dates, weekly study
              sessions, and reminders together in one planner. That makes it
              easier to see how busy each week is and plan ahead before multiple
              deadlines land at the same time.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for Australian university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner suits Australian university students who want
              a straightforward way to plan semester work, track deadlines, log
              study sessions, and keep an eye on marks. The layout is designed
              to feel calm rather than busy.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online study planner for uni?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise your university subjects, due dates, and study
              sessions. That gives you a simple way to test the planner with
              your real semester workload before deciding on premium.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}