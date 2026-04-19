import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best marks tracker for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best marks tracker for students is one that helps you record grades, see subject progress, and keep results in one place without feeling cluttered. MyStudyPlanner gives students a calm way to track marks alongside the rest of their study routine.",
      },
    },
    {
      "@type": "Question",
      name: "How can students keep track of marks and grades?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Students can keep track of marks and grades by recording results for each subject in one planner. This makes it easier to see how each subject is going, notice patterns over time, and decide where more study is needed.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for tracking school and university marks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works for both high school and university students who want a simple way to track marks, review results, and keep subject progress visible during term or semester.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner to track grades with the rest of my study planning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner lets students keep marks, assignments, exams, and study sessions connected in one place, which makes it easier to understand results in the context of the full workload.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Marks Tracker for Students | MyStudyPlanner";
  const description =
    "A calm marks tracker for students. Record grades, review subject progress, and keep results organised in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/marks-tracker-for-students",
    },
    openGraph: {
      title,
      description,
      url: "/marks-tracker-for-students",
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
    title: "Keep marks in one place",
    description:
      "Record results by subject so you do not need to search through portals, emails, or notes to see how things are going.",
  },
  {
    title: "See subject progress more clearly",
    description:
      "A simple marks tracker helps you notice which subjects feel steady and which ones may need more attention.",
  },
  {
    title: "Review results over time",
    description:
      "Looking at marks across the term or semester gives you a better sense of patterns than single results on their own.",
  },
  {
    title: "Connect grades to your study routine",
    description:
      "Marks make more sense when you can view them alongside assignments, exams, and study sessions in the same planner.",
  },
];

export default function MarksTrackerForStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-marks-tracker-for-students"
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

        <p className="text-sm text-muted-foreground">Marks and grades</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Marks tracker for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm marks tracker for students who want one place
          to record grades, review subject progress, and keep results organised
          alongside assignments, exams, and study sessions. It is built for high
          school and university students who want a clearer picture of how their
          subjects are going without using a cluttered spreadsheet or a busy
          productivity app.
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
          Why students look for a marks tracker
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of students know when a result feels good or bad, but they do
            not always have a clear view of how each subject is going overall.
            Marks often arrive one at a time through school portals, learning
            platforms, emails, or class announcements. That can make it hard to
            step back and see the bigger picture across the term or semester.
          </p>
          <p>
            A marks tracker helps because it gives your results one place to
            live. Instead of trying to remember past scores or searching through
            different systems, you can keep grades organised by subject and
            review them over time. That makes it easier to spot patterns, see
            where you are improving, and notice where extra support or more
            study time might be needed.
          </p>
          <p>
            MyStudyPlanner is built around that kind of calm visibility. It is
            not only about chasing numbers. It is about helping students
            understand their workload and progress more clearly. If you want the
            broader product view, the homepage explains how it works as a{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for students
            </Link>
            . This page focuses on the marks tracking side of the planner.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-border bg-background/60 p-4"
            >
              <div className="text-sm font-semibold text-foreground">
                {benefit.title}
              </div>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What students usually want to know from their grades
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Most students are not only asking what mark they got on one task.
            They are also trying to work out what that result means for the
            subject overall. Is the subject going better than it felt? Are marks
            staying steady? Did one poor result affect confidence more than it
            should have? These questions are hard to answer when results are
            scattered and not easy to compare.
          </p>
          <p>
            A useful marks tracker helps students keep those answers in view. It
            lets you look at results by subject, notice where you are doing
            well, and identify where your study habits may need to shift. That
            is especially useful during busy terms or semesters, when it is easy
            to focus only on the next assignment and lose sight of how each
            subject is progressing overall.
          </p>
          <p>
            MyStudyPlanner keeps marks close to the rest of your planning
            routine. That means grades do not sit in isolation. You can look at
            results while also seeing your assignments, exams, and study
            sessions. If you mainly want help keeping deadlines visible, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page goes deeper into that use case.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          How MyStudyPlanner helps students track marks more clearly
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner helps students keep results organised without turning
            marks into a complicated data project. You can record grades, review
            subject progress, and keep those results near the rest of your study
            routine. That matters because marks are most useful when they help
            you make practical decisions about what to work on next.
          </p>
          <p>
            For example, if one subject has several lower results in a row, that
            may be a sign to schedule more revision, ask for help, or change how
            you are preparing for assessments. If another subject is going well,
            it may need less extra attention for now. A calmer marks tracker
            helps you make those choices based on a clearer picture rather than
            a vague feeling.
          </p>
          <p>
            This also makes results easier to review over time. One mark on its
            own can feel bigger than it really is. When you can see several
            results together, the subject often looks more balanced and easier
            to understand. That can reduce unnecessary stress and help you focus
            on what is actually worth improving.
          </p>
          <p>
            If exam preparation is the part of study life you want to improve
            alongside marks, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page is also relevant.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Useful for high school and university students
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Marks tracking can help at both high school and university, but the
            routine may look a little different. High school students often want
            to keep track of tests, assignments, and report style results across
            several subjects each term. University students may be reviewing
            marks across essays, quizzes, labs, projects, and exams over a
            longer semester timeline.
          </p>
          <p>
            MyStudyPlanner works for both. It gives students one place to keep
            results visible while still fitting those grades into a broader
            planning system. If you want a page written more directly for school
            students, visit the{" "}
            <Link
              href="/study-planner-for-high-school-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for high school students
            </Link>{" "}
            page. If you are at uni, the{" "}
            <Link
              href="/study-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for university students
            </Link>{" "}
            page may be a better fit for the bigger semester view.
          </p>
          <p>
            In both cases, the value is similar. When results are easier to see,
            it becomes easier to respond calmly instead of guessing how things
            are going.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Why marks tracking works better inside a full study planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A marks tracker is most useful when it is not separate from the rest
            of your study life. Results are connected to how you prepared, what
            deadlines overlapped, how much revision you had time for, and which
            subjects were demanding more attention at the time. When marks live
            in a spreadsheet that is disconnected from everything else, that
            context is easy to lose.
          </p>
          <p>
            MyStudyPlanner brings those parts together. You can keep marks near
            assignments, homework, exam dates, and study sessions in one calmer
            system. If regular school tasks are a big part of your week, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page explains that part of the routine. If you are comparing app
            options more broadly, the{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>{" "}
            page is also relevant.
          </p>
          <p>
            This is one of the reasons the planner feels more useful than a
            simple grade list. It helps students understand marks in context,
            which makes the results more practical and less abstract.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for students in Australia who want less clutter
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner suits Australian students who want a simpler way to
            review progress during term or semester. Whether you are managing
            school subjects, Year 11 or Year 12 assessments, or university units
            across the semester, it helps to have a calm place to keep results
            visible.
          </p>
          <p>
            That is why the layout stays straightforward. There are no streaks,
            badges, or noisy extras around your results. The point is simply to
            help you understand how each subject is going and decide where your
            attention is best spent next.
          </p>
          <p>
            Marks tracking is available as part of the premium experience, which
            starts from $2.99 per month. Students can still start with the core
            planner first and decide later whether marks tracking and insights
            are useful for them.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The demo is the easiest way to see how MyStudyPlanner works before
            creating an account. It shows the real planner with sample data, so
            you can click through the dashboard, calendar, tasks, study log,
            marks, reminders, and settings.
          </p>
          <p>
            Then if it feels right, you can create an account and start adding
            your own subjects, deadlines, and study routine. You do not need to
            set up everything at once. Even a few real tasks and results can
            make your progress feel easier to understand.
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
              What is the best marks tracker for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best marks tracker for students is one that helps you record
              grades, see subject progress, and keep results in one place
              without feeling cluttered. MyStudyPlanner gives students a calm
              way to track marks alongside the rest of their study routine.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can students keep track of marks and grades?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Students can keep track of marks and grades by recording results
              for each subject in one planner. This makes it easier to see how
              each subject is going, notice patterns over time, and decide where
              more study is needed.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for tracking school and university marks?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works for both high school and university
              students who want a simple way to track marks, review results, and
              keep subject progress visible during term or semester.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner to track grades with the rest of my study
              planning?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner lets students keep marks, assignments, exams,
              and study sessions connected in one place, which makes it easier
              to understand results in the context of the full workload.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}