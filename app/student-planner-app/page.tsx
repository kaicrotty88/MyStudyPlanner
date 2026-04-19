import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best student planner app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best student planner app is one that helps you organise assignments, homework, exams, study sessions, and marks in one place without feeling cluttered. MyStudyPlanner is designed for students who want a calm and simple planning routine.",
      },
    },
    {
      "@type": "Question",
      name: "How can a student planner app help students stay organised?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A student planner app helps by keeping subjects, due dates, study sessions, reminders, and results together in one place. This makes it easier to see what is coming up, plan the week, and avoid missing important deadlines.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for high school and university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works for both high school and university students who want a practical way to organise daily work, assignments, exams, and study time without using a busy productivity system.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online student planner app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise subjects, assignments, homework, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Student Planner App for Students | MyStudyPlanner";
  const description =
    "A calm student planner app for students. Organise assignments, homework, exams, study sessions, and marks in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/student-planner-app",
    },
    openGraph: {
      title,
      description,
      url: "/student-planner-app",
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

const features = [
  {
    title: "Assignments and homework together",
    description:
      "Keep regular school or uni work in one place so deadlines do not get lost across different apps or notes.",
  },
  {
    title: "Exams and due dates visible",
    description:
      "See important dates clearly and plan your week around what is coming up next.",
  },
  {
    title: "Study session planning",
    description:
      "Add study sessions to help spread work across the week instead of leaving everything too late.",
  },
  {
    title: "Marks tracking and insights",
    description:
      "Review results over time and get a clearer picture of how each subject is going.",
  },
];

export default function StudentPlannerAppPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-student-planner-app"
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

        <p className="text-sm text-muted-foreground">Student planning</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Student planner app
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm student planner app for students who want one
          place to organise assignments, homework, exams, study sessions,
          reminders, and marks. It is built for high school and university
          students who want a clearer way to manage study without using a busy
          productivity system.
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
          What a student planner app should actually help with
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A good student planner app should help students stay organised in a
            way that feels realistic. That usually means keeping the everyday
            parts of student life together. Assignments, homework, exams, study
            sessions, reminders, and marks all affect each other, so it helps to
            see them in one place instead of trying to piece them together from
            different tools.
          </p>
          <p>
            A lot of students end up with a mix of phone reminders, class
            portals, notebooks, calendars, and notes apps. Each of those can be
            useful on its own, but the full workload still feels scattered when
            everything is split up. You may know you have things due, but not
            feel sure how busy the week actually is. That is where a student
            planner app becomes useful. It gives you a clearer overview so you
            can make better decisions earlier.
          </p>
          <p>
            MyStudyPlanner is built around that simple idea. It is not trying to
            turn study into a game or a complicated system. It is designed to
            feel calm, clear, and easy to keep using. If you want a broader
            introduction to the product, the homepage explains how it works as a{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for students
            </Link>
            . This page focuses on why it works well as a student planner app
            specifically.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background/60 p-4"
            >
              <div className="text-sm font-semibold text-foreground">
                {feature.title}
              </div>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Why MyStudyPlanner is different from generic planning apps
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Many planning apps are either too general or too cluttered. Some are
            really built for work projects, not student life. Others are packed
            with features that look impressive but feel hard to keep up with
            once your term or semester gets busy. When that happens, even a good
            system can turn into something you stop opening.
          </p>
          <p>
            MyStudyPlanner is designed to stay focused on what students actually
            need. Instead of pushing lots of visual noise, streaks, or gamified
            extras, it keeps the important things visible. You can organise
            assignments, add homework, log study sessions, keep exam dates
            nearby, and track marks with a layout that feels calm rather than
            overwhelming.
          </p>
          <p>
            That matters because planning only helps if you keep using it. A
            student planner app should not feel like another task on your list.
            It should make your workload easier to understand, so you can move
            on with the actual study. If you want something that works in the
            browser and stays simple, the{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>{" "}
            page explains that side of MyStudyPlanner in more detail.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Useful for high school and university students
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Student life looks different depending on where you are studying.
            High school students often need help staying on top of homework,
            assignments, and test prep across several subjects each week.
            University students usually deal with fewer but larger deadlines,
            more independent study, and longer assignment timelines. A good
            student planner app needs to work for both without becoming messy.
          </p>
          <p>
            MyStudyPlanner fits both types of routine. It gives you one place to
            see subjects, due dates, and study time together, while still
            keeping the layout simple. If you want a page written more directly
            for school students, visit the{" "}
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
            page goes deeper into that use case.
          </p>
          <p>
            In both cases, the benefit is the same. When your study life is
            easier to see, it becomes easier to plan calmly and stay on top of
            what matters next.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          One app for assignments, homework, exams, and marks
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A student planner app becomes much more useful when it covers the
            full study routine rather than one small part of it. Assignments
            affect revision time. Homework affects how busy your week feels.
            Exam dates change which subjects need attention first. Marks help
            you decide where extra effort might be needed. When those things are
            all separate, it is harder to get a proper view of your workload.
          </p>
          <p>
            MyStudyPlanner brings those parts together. If deadlines are the
            main thing you want to manage, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page explains that workflow. If regular school tasks matter more,
            visit the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page. If exam periods are where things usually feel most stressful,
            the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page is also relevant.
          </p>
          <p>
            Students who want to review results over time can also look at the{" "}
            <Link
              href="/marks-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              marks tracker for students
            </Link>{" "}
            page. These different pages cover different search intents, but they
            all point back to the same core idea: one calm planner that helps
            you stay organised without extra clutter.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A free way to get started with a calmer planning routine
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner has a free tier, so students can start using the core
            planner without needing to commit straight away. That is useful when
            you want to test whether a planning routine actually fits your week
            before thinking about anything extra. It also means you can start
            with real subjects, real deadlines, and real study sessions instead
            of guessing from screenshots.
          </p>
          <p>
            Premium starts from $2.99 per month and adds features like marks
            tracking and insights, but the main value of the app starts with the
            basics. You do not need to set everything up perfectly on day one.
            Add your subjects, enter a few upcoming tasks, and build the habit
            from there. If you want to read more about starting without paying,
            the{" "}
            <Link
              href="/free-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              free study planner
            </Link>{" "}
            page explains that option more clearly.
          </p>
          <p>
            For students in Australia especially, where school terms and uni
            semesters can get busy quickly, having a simple app that is easy to
            keep up with can make a big difference. The calmer the system feels,
            the more likely it is to stay useful when things get full.
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
            Then if it feels right, you can start with a free account and build
            your own routine from there. You do not need a perfect setup. Even a
            few real deadlines and study sessions can make the next week feel
            clearer.
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
              What is the best student planner app?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best student planner app is one that helps you organise
              assignments, homework, exams, study sessions, and marks in one
              place without feeling cluttered. MyStudyPlanner is designed for
              students who want a calm and simple planning routine.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can a student planner app help students stay organised?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              A student planner app helps by keeping subjects, due dates, study
              sessions, reminders, and results together in one place. This makes
              it easier to see what is coming up, plan the week, and avoid
              missing important deadlines.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for high school and university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works for both high school and university
              students who want a practical way to organise daily work,
              assignments, exams, and study time without using a busy
              productivity system.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online student planner app?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to organise subjects, assignments, homework, and study
              sessions before deciding whether you want premium features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}