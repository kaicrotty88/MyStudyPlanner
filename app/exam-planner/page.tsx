import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best exam planner for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best exam planner for students is one that helps you organise exam dates, revision sessions, subject priorities, and study time in one place. MyStudyPlanner is designed to make exam planning feel clear and manageable.",
      },
    },
    {
      "@type": "Question",
      name: "How can students plan revision for exams better?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Students can plan revision better by keeping exam dates, study sessions, and subject priorities together in one planner. This makes it easier to start earlier, spread revision across the week, and avoid last minute cramming.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for high school and university exam planning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works for both high school and university students who want a calm way to organise exam dates, revision, assignments, and study sessions in one place.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online exam planner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise exam dates, revision sessions, and subject workload before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Exam Planner for Students | MyStudyPlanner";
  const description =
    "A calm exam planner for students. Organise exam dates, revision sessions, and study time in one simple place.";

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
    title: "See exam dates clearly",
    description:
      "Keep upcoming exams visible so you can tell which subjects need attention first and when revision should begin.",
  },
  {
    title: "Plan revision across the week",
    description:
      "Spread study sessions over time instead of relying on a last minute rush before the exam.",
  },
  {
    title: "Balance exams with other work",
    description:
      "Keep revision alongside assignments, homework, and regular tasks so your workload feels more realistic.",
  },
  {
    title: "Reduce mental clutter",
    description:
      "A simple exam planner helps you stop trying to hold every date and study priority in your head.",
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

        <p className="text-sm text-muted-foreground">For exam preparation</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Exam planner for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm exam planner for students who want one place
          to organise exam dates, revision sessions, subject priorities,
          reminders, and study time. It helps high school and university
          students prepare for exams in a way that feels clear, steady, and easy
          to keep up with.
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
          Why students need an exam planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Exam stress usually builds long before the exam itself. It starts
            when dates are approaching, subjects feel uneven, and revision is
            meant to happen somewhere between classes, assignments, homework,
            and everything else in your week. A lot of students know they need
            to revise, but they do not always have a clear plan for when or how
            that revision will fit into real life.
          </p>
          <p>
            An exam planner helps because it turns revision into something more
            visible and manageable. Instead of thinking about exams as one big
            stressful block in the future, you can start to see which subjects
            need attention first, where your available study time actually is,
            and how to spread preparation across the days leading up to each
            exam.
          </p>
          <p>
            MyStudyPlanner is designed around that practical need. It is not a
            flashy productivity app filled with distractions. It is a simple way
            for students to organise exam dates, plan revision, and feel clearer
            about what to focus on next. If you are looking for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , this page focuses on the exam side of that routine.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What students usually need to plan for exams
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful exam planner needs to do more than list test dates. Most
            students also need to know which subjects need more work, how much
            time is available before each exam, and how revision fits around
            assignments, classes, and other commitments. Without that context,
            an exam date alone can still feel vague until the pressure becomes
            immediate.
          </p>
          <p>
            For example, two exams in the same week may need very different
            preparation. One subject might only need light review, while another
            needs more consistent revision across several topics. A good exam
            planner helps you see those differences so your study time feels
            purposeful rather than random.
          </p>
          <p>
            MyStudyPlanner keeps exam planning close to the rest of your study
            routine. You can organise revision sessions, keep subjects visible,
            and plan around other deadlines without splitting everything across
            several apps. If assignments are also crowding your exam period, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page can help with that side of your workload too.
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
          How MyStudyPlanner helps with revision planning
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner helps students turn exam preparation into a more
            realistic plan. You can add subjects, enter exam dates, and use
            study sessions to map out revision before the final few days. That
            means your planner is not only showing what is coming up, but also
            supporting how you prepare for it.
          </p>
          <p>
            This matters because revision often gets squeezed out by urgent
            tasks. If you only react to what feels most immediate each day, exam
            preparation can end up pushed aside until it becomes a problem. A
            planner makes revision visible earlier, which gives you more chance
            to build steadier study across the week.
          </p>
          <p>
            MyStudyPlanner also works well for students who want a simpler
            system. You do not need to build a complicated revision timetable to
            get value from it. Add your subjects, put in the important dates,
            and start with a few planned study sessions. That is often enough to
            make exam preparation feel less scattered.
          </p>
          <p>
            Because it runs in the browser, it also suits students looking for
            an{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>{" "}
            they can check and update anywhere.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Useful for high school and university exam periods
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Exam planning matters in both high school and university, but the
            pressure can look a little different. High school students often
            need to revise across multiple subjects at once while staying on top
            of regular homework and class tasks. University students may be
            preparing for fewer exams overall, but they are often balancing that
            revision against large assignments and more independent study.
          </p>
          <p>
            MyStudyPlanner works for both. It helps students see exam dates,
            study sessions, and other academic work together so preparation
            feels more grounded in the reality of the week. If you want a page
            written more directly for school life, the{" "}
            <Link
              href="/study-planner-for-high-school-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for high school students
            </Link>{" "}
            page is relevant. If your routine looks more like semester planning
            at uni, visit the{" "}
            <Link
              href="/study-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for university students
            </Link>{" "}
            page.
          </p>
          <p>
            In both cases, the goal is the same. When exam preparation is easier
            to see, it becomes easier to start earlier and manage more calmly.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A calmer alternative to cramming and scattered revision notes
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of students already have some kind of exam routine, but it is
            often messy. Dates might be on the school portal or subject outline,
            revision topics might be written in a notebook, and actual study
            time may only exist as a vague intention. When those pieces do not
            come together, revision can feel uncertain right up until exam week.
          </p>
          <p>
            MyStudyPlanner brings those pieces into one calmer structure.
            Subjects, exam dates, study sessions, and reminders can sit together
            without making planning feel busy. If you also want a better way to
            manage regular work during exam periods, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page is helpful. If you want to review subject results over time,
            the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page covers that part of the planner as well.
          </p>
          <p>
            The point is not to fill every spare hour with study. The point is
            to make exam preparation easier to understand and easier to act on.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for Australian students who want less clutter
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner suits Australian students who want a straightforward
            way to handle exam periods. Whether you are managing school term
            tests, Year 11 or Year 12 revision, or university exams at the end
            of semester, a planner needs to be simple enough to trust during
            busy weeks.
          </p>
          <p>
            That is why the layout stays calm and focused. There are no streaks,
            badges, or distracting extras pulling attention away from your real
            workload. The planner is there to help you see what is coming up,
            what needs revision first, and how your study time fits around the
            rest of your week.
          </p>
          <p>
            You can start with a free account and try it with real exam dates
            and study sessions before deciding whether premium features are
            useful for you.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The demo is the easiest way to see if MyStudyPlanner fits how you
            work. It shows the real planner with sample data, so you can click
            through the dashboard, calendar, tasks, study log, marks,
            reminders, and settings before creating an account.
          </p>
          <p>
            Then if it feels right, you can start with a free account and add
            your own subjects and exam dates. You do not need a perfect setup on
            day one. Even a small amount of revision planning can make the next
            few weeks feel clearer.
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
              What is the best exam planner for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best exam planner for students is one that helps you organise
              exam dates, revision sessions, subject priorities, and study time
              in one place. MyStudyPlanner is designed to make exam planning
              feel clear and manageable.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can students plan revision for exams better?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Students can plan revision better by keeping exam dates, study
              sessions, and subject priorities together in one planner. This
              makes it easier to start earlier, spread revision across the week,
              and avoid last minute cramming.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for high school and university exam
              planning?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works for both high school and university
              students who want a calm way to organise exam dates, revision,
              assignments, and study sessions in one place.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online exam planner?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise exam dates, revision sessions, and subject
              workload before deciding whether you want premium features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}