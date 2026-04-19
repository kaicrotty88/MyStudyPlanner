import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best study planner for high school students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best study planner for high school students is one that keeps homework, assignments, exams, study sessions, and marks in one place. MyStudyPlanner is built for that simple kind of school planning, without extra clutter.",
      },
    },
    {
      "@type": "Question",
      name: "How can high school students keep track of homework and assignments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "High school students can stay organised by keeping homework, assignment deadlines, test dates, and study sessions together in one planner. This makes it easier to see what is due first and plan the week before work piles up.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for Australian high school students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner suits Australian high school students who want a calm and practical way to stay on top of school work, revision, and marks during term.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online study planner for school?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise subjects, homework, assignment deadlines, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Study Planner for High School Students | MyStudyPlanner";
  const description =
    "A calm study planner for high school students. Organise homework, assignments, exams, study sessions, and marks in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/study-planner-for-high-school-students",
    },
    openGraph: {
      title,
      description,
      url: "/study-planner-for-high-school-students",
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
    title: "Keep school work together",
    description:
      "Homework, assignments, exams, and study sessions stay in one place instead of being scattered across apps and notes.",
  },
  {
    title: "Stay ahead of deadlines",
    description:
      "See what is due next and what needs early attention before school work starts stacking up.",
  },
  {
    title: "Build steadier study habits",
    description:
      "Use short study sessions across the week instead of trying to catch up all at once before a test.",
  },
  {
    title: "Track progress over time",
    description:
      "Marks help you get a clearer picture of how each subject is going during the term.",
  },
];

export default function HighSchoolStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-study-planner-high-school-students"
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

        <p className="text-sm text-muted-foreground">For high school students</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Study planner for high school students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm study planner for high school students who
          want one place to organise homework, assignments, exams, study
          sessions, reminders, and marks. It is built for school life in a way
          that feels clear and simple, so planning does not become another thing
          to stress about.
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
          Why high school students need a proper study planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            High school can feel manageable at the start of term, then suddenly
            become busy all at once. You might have homework due tomorrow, an
            assignment due next week, a test coming up, and a teacher reminding
            you about something else in class. A lot of students try to keep all
            of that in their head, or spread it across notebooks, reminders, and
            calendar events. That usually works for a little while, but once
            things get busy it becomes harder to tell what matters most.
          </p>
          <p>
            A study planner for high school students helps because it brings
            school work into one place. Instead of jumping between different
            tools or trying to remember every deadline, you can see homework,
            assignments, study sessions, and exams together. That makes it
            easier to plan the week and feel less rushed when several subjects
            need attention at the same time.
          </p>
          <p>
            MyStudyPlanner is designed around that simple idea. It is not meant
            to feel like a complicated productivity system. It is a calm planner
            for students who want something easy to check, easy to update, and
            easy to keep using through the school term. If you are also looking
            for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , this page explains how MyStudyPlanner fits high school life
            specifically.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What high school students usually need to keep track of
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful study planner for school needs to do more than list a few
            due dates. Most students are juggling homework, assignments, tests,
            revision, class reminders, and results across several subjects at
            once. When those things live in different places, it becomes harder
            to see how busy the week really is.
          </p>
          <p>
            You might have maths homework in one notebook, an English assignment
            on the school portal, a science test date written in class, and a
            reminder in your phone about something else. None of that gives you
            a clear view of your full workload. A proper high school planner
            helps by putting those pieces together so you can tell what needs to
            be done now and what you can plan for later in the week.
          </p>
          <p>
            If homework is the main thing you want to manage better, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page goes deeper into that. If assignments are where things usually
            start slipping, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page is also worth reading.
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
          How MyStudyPlanner helps with homework, assignments, and revision
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner gives high school students a simple way to organise
            school work without overcomplicating it. You can add your subjects,
            keep homework and assignments visible, plan study sessions before
            tests, and track marks as results come back. That gives you a
            clearer picture of how school is going across the term.
          </p>
          <p>
            This matters because school pressure often comes from several small
            things landing together. You might not have one huge task, but you
            could have a worksheet, reading, a short quiz, and preparation for a
            bigger assignment all in the same week. When that happens, clarity
            matters more than complexity. A calm planner helps you see the week
            properly and make better decisions earlier.
          </p>
          <p>
            You also do not need to build a detailed system before the planner
            becomes useful. Add your classes, enter the important dates, and
            start with the work that is already coming up. Even a small amount
            of planning can make the week feel more manageable.
          </p>
          <p>
            Because it works in the browser, MyStudyPlanner also suits students
            looking for an{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>{" "}
            that is easy to open and update whenever they need it.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A calmer alternative to generic productivity apps
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of students try general notes apps, digital to do lists, or
            calendar tools first. Those apps can help in some ways, but they are
            not really built around school. They often feel too broad, too busy,
            or too hard to keep updated once term becomes full. When that
            happens, the system starts to feel like extra work.
          </p>
          <p>
            MyStudyPlanner stays focused on what students actually need.
            Homework, assignments, study sessions, exam dates, reminders, and
            marks are already part of the planning flow. You do not need to turn
            a work-style app into something that fits school. That makes it
            easier to come back to the planner each day and trust what you see.
          </p>
          <p>
            If exams are the part of school life that usually feels the most
            stressful, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page explains how to use the planner for revision and test prep. If
            you also want a simple way to review results, the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page covers that side of the planner as well.
          </p>
          <p>
            The point is not to pack every afternoon with tasks. The point is to
            help school work feel clearer and easier to manage.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for Australian high school students who want less clutter
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is a good fit for Australian high school students who
            want something practical rather than flashy. School terms can be
            busy, especially when classes, homework, assessments, and activities
            all overlap. A planner needs to be simple enough to use quickly and
            useful enough to keep returning to throughout the term.
          </p>
          <p>
            That is why the layout stays calm and focused. There are no streaks,
            badges, or distracting extras trying to pull your attention away
            from actual school work. The goal is to help you see what is coming
            up, what is overdue, and what you should work on next.
          </p>
          <p>
            You can start with a free account and use the planner with real
            school work straight away. That makes it easy to test whether the
            routine suits you before deciding if premium features are worth it.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The easiest way to see if MyStudyPlanner feels right is to try the
            demo first. The demo shows the real planner with sample data, so you
            can click through the dashboard, calendar, tasks, study log, marks,
            reminders, and settings. It gives you a much better feel for the
            layout than a short description ever could.
          </p>
          <p>
            Then if it works for you, create a free account and start with your
            own subjects and deadlines. You do not need to set up everything at
            once. Even adding a few real homework tasks and test dates can make
            the week feel clearer.
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
              What is the best study planner for high school students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best study planner for high school students is one that keeps
              homework, assignments, exams, study sessions, and marks in one
              place. MyStudyPlanner is designed for students who want a planner
              that feels clear, simple, and easy to keep using throughout the
              school term.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can high school students keep track of homework and
              assignments?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The simplest way is to keep homework, assignment deadlines, test
              dates, and study sessions together in one planner. That makes it
              easier to see what is due first and avoid leaving too much school
              work until the last minute.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for Australian high school students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner suits Australian high school students who want
              a calm and practical way to manage school work, revision, and
              marks. It is built to feel helpful during term rather than busy or
              distracting.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online study planner for
              school?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise subjects, homework, assignment deadlines, and
              study sessions. That gives you a simple way to test the planner
              with real school work before deciding on premium.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}