import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best homework planner for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best homework planner for students is one that keeps homework, assignments, study sessions, and subject deadlines in one place. MyStudyPlanner is built to help students stay organised with a calm and simple layout.",
      },
    },
    {
      "@type": "Question",
      name: "How can students keep track of homework better?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Students can keep track of homework better by using one planner for daily tasks, subject work, study time, and due dates. This makes it easier to see what needs to be done first and avoid forgetting smaller tasks.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for school and uni homework planning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works for both high school and university students who want a simple way to manage homework, assignments, revision, and reminders in one place.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online homework planner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise homework, due dates, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Homework Planner for Students | MyStudyPlanner";
  const description =
    "A calm homework planner for students. Keep homework, assignments, study sessions, and due dates organised in one place.";

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
    title: "Keep daily homework visible",
    description:
      "See what needs to be done today, tomorrow, and later in the week without relying on memory.",
  },
  {
    title: "Avoid forgotten small tasks",
    description:
      "Homework can be easy to miss because it feels smaller than assignments, but it still adds up quickly.",
  },
  {
    title: "Plan around your real week",
    description:
      "Use study sessions and task planning to fit homework around classes, activities, work, and other commitments.",
  },
  {
    title: "Stay calmer during busy terms",
    description:
      "A simple homework planner helps you feel clearer about what is due instead of constantly trying to remember it all.",
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

        <p className="text-sm text-muted-foreground">For everyday student work</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Homework planner for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm homework planner for students who want one
          place to organise daily homework, assignments, study sessions,
          reminders, and subject deadlines. It helps high school and university
          students keep up with regular work in a way that feels simple and easy
          to maintain.
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
          Why students need a homework planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Homework often seems small compared with larger assignments or exam
            prep, but it is one of the main reasons students start to feel
            behind. A worksheet here, a reading task there, something to finish
            for tomorrow, and another task due later in the week can quickly
            become hard to keep track of. Because homework is often spread
            across classes and smaller deadlines, it is easy for it to slip
            through the gaps.
          </p>
          <p>
            A homework planner for students helps by making regular work more
            visible. Instead of trying to remember every task from class, school
            portal updates, or notes in different places, you can keep homework
            together in one planner. That makes it easier to see what should be
            done first and what can be planned for later in the week.
          </p>
          <p>
            MyStudyPlanner is designed around that kind of day to day student
            planning. It is not trying to turn homework into a complicated
            system. It gives you a clear place to organise tasks, subject work,
            and study sessions so school or uni life feels a bit less crowded.
            If you are looking for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , this page focuses on the homework side of that routine.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What students usually need to keep track of for homework
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful homework planner needs to do more than hold a basic to do
            list. Most students also need to know which subject a task belongs
            to, when it is due, how urgent it is, and how it fits alongside
            other work. Homework may be smaller than an assignment, but when
            several subjects are involved it can still shape your whole week.
          </p>
          <p>
            For example, you might have reading for English, questions for
            maths, preparation for a science class, and revision for a quiz all
            in the same few days. Each task may look manageable on its own, but
            together they still need time and attention. A proper homework
            planner helps you see that full picture instead of noticing each
            task one by one as it becomes urgent.
          </p>
          <p>
            MyStudyPlanner keeps homework close to the rest of your study
            routine, so you can see smaller tasks alongside assignments, exam
            preparation, and reminders. If you mainly want help with bigger
            deadlines as well, the{" "}
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
          How MyStudyPlanner helps with daily homework planning
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is designed to make regular student work easier to
            organise. You can add subjects, enter homework tasks, plan study
            sessions, and keep reminders nearby so your week feels clearer. That
            is helpful because homework often sits in the background until it
            starts building up. A planner gives those tasks enough visibility to
            deal with them before they become stressful.
          </p>
          <p>
            This is especially useful for students who prefer simple routines.
            You do not need to build a detailed productivity system or spend
            ages setting things up. Add your subjects, enter what is coming up,
            and keep going from there. Even a small amount of planning can make
            a busy week feel more manageable.
          </p>
          <p>
            Homework planning also works better when it sits next to your other
            academic commitments. A task due tomorrow matters differently if you
            also have a test later in the week or an assignment getting close.
            MyStudyPlanner helps you see those things together, which makes it
            easier to decide what should be done first.
          </p>
          <p>
            Because it works in the browser, it also suits students looking for
            an{" "}
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
          Useful for high school homework and university study tasks
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Homework is most closely linked with school life, but regular study
            tasks matter at university too. High school students often need to
            keep track of nightly or weekly homework across several subjects,
            while university students may be managing readings, preparation
            tasks, short quizzes, and ongoing course work outside class time.
          </p>
          <p>
            MyStudyPlanner works for both. It helps students keep regular work
            visible while still fitting it into a bigger study routine. If you
            want a page written more directly for school life, the{" "}
            <Link
              href="/study-planner-for-high-school-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for high school students
            </Link>{" "}
            page may be the best place to start. If your workload looks more
            like semester planning at uni, the{" "}
            <Link
              href="/study-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for university students
            </Link>{" "}
            page is more relevant.
          </p>
          <p>
            In both cases, the goal is the same. When everyday work is easy to
            see, it becomes easier to keep up with and less likely to turn into
            a bigger source of stress later.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A simpler alternative to scattered notes and class reminders
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of students already have a partial system for homework. Some
            tasks are written in a notebook, some are on a school portal, some
            are remembered from class, and some live in a phone reminder. The
            problem is not that these tools are useless. The problem is that
            they are separate, which makes it harder to trust that you are
            seeing everything in one place.
          </p>
          <p>
            MyStudyPlanner brings those pieces together into a calmer routine.
            Homework, assignments, and study sessions can sit alongside each
            other without turning into a busy dashboard. If exam preparation is
            also something you need to organise, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page explains how to manage revision more clearly. If you want to
            review results over time as well, the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page covers that part of the planner too.
          </p>
          <p>
            The aim is not to make your week feel packed. The aim is to make
            your homework and study routine easier to understand.
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
            your real subjects and homework. You do not need to set up
            everything perfectly from day one. Even a few tasks and due dates
            can make the week ahead feel clearer.
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
              What is the best homework planner for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best homework planner for students is one that keeps
              homework, assignments, study sessions, and subject deadlines in
              one place. MyStudyPlanner is built to help students stay
              organised with a calm and simple layout.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can students keep track of homework better?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Students can keep track of homework better by using one planner
              for daily tasks, subject work, study time, and due dates. This
              makes it easier to see what needs to be done first and avoid
              forgetting smaller tasks.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for school and uni homework planning?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works for both high school and university
              students who want a simple way to manage homework, assignments,
              revision, and reminders in one place.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online homework planner?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise homework, due dates, and study sessions before
              deciding whether you want premium features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}