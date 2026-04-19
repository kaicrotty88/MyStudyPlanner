import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best assignment tracker for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best assignment tracker for students is one that keeps due dates, subject details, study sessions, and progress in one place. MyStudyPlanner helps students track assignments clearly without adding extra clutter.",
      },
    },
    {
      "@type": "Question",
      name: "How can students keep track of assignment deadlines?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Students can keep track of assignment deadlines by using one planner for subjects, due dates, smaller tasks, and revision sessions. This makes it easier to see what is due first and avoid last minute rush.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for tracking university and high school assignments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works for both high school and university students who want a calm way to organise assignments, homework, study sessions, and exam preparation in one place.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online assignment tracker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to track assignments, deadlines, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Assignment Tracker for Students | MyStudyPlanner";
  const description =
    "A calm assignment tracker for students. Keep deadlines, homework, study sessions, and subjects organised in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/assignment-tracker-for-students",
    },
    openGraph: {
      title,
      description,
      url: "/assignment-tracker-for-students",
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
    title: "See assignment deadlines clearly",
    description:
      "Keep upcoming due dates visible so you can tell what needs attention this week and what can wait.",
  },
  {
    title: "Break big tasks into smaller steps",
    description:
      "Track progress on essays, reports, projects, and homework without relying on memory alone.",
  },
  {
    title: "Plan study around real deadlines",
    description:
      "Use study sessions to prepare for assignments earlier instead of starting everything close to the due date.",
  },
  {
    title: "Keep subjects organised together",
    description:
      "See each class, task, and deadline in one place instead of switching between notes apps, calendars, and reminders.",
  },
];

export default function AssignmentTrackerForStudentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-assignment-tracker-for-students"
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

        <p className="text-sm text-muted-foreground">For students managing due dates</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Assignment tracker for students
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a calm assignment tracker for students who want one
          place to keep deadlines, homework, study sessions, and subject work
          organised. It helps high school and university students see what is
          due, plan ahead, and stay on top of assignments without building a
          complicated system.
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
          Why students need an assignment tracker
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Assignments rarely feel stressful because of one deadline on its
            own. The pressure usually comes when several pieces of work start
            overlapping. You might have a short homework task due tomorrow, a
            larger assignment due next week, and a test to revise for at the
            same time. When everything lives in different places, it becomes
            harder to tell what matters first.
          </p>
          <p>
            A good assignment tracker for students helps by pulling those
            deadlines into one clear view. Instead of relying on memory, class
            portals, scattered notes, or phone reminders, you can see upcoming
            work together. That makes it easier to plan your week calmly and
            avoid the feeling that something important might be missing.
          </p>
          <p>
            MyStudyPlanner is built around that kind of everyday student
            planning. It is not trying to be a complex project management tool.
            It is a simple way to track assignments, organise study sessions,
            and keep school or uni work feeling more manageable. If you are
            looking for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , this page focuses on the assignment side of that routine.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What students usually need to track for assignments
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful assignment tracker does more than list a deadline. Most
            students also need to know which subject the task belongs to, how
            big it is, what stage it is at, and whether they have set aside time
            to work on it. Without that context, a deadline can still sneak up
            on you even if it is written down somewhere.
          </p>
          <p>
            Many students try to manage this with a mix of class portals,
            notebook lists, and mental notes. The problem is that these pieces
            do not always connect. You may remember the due date but forget that
            you still need time for research, planning, or revision. An
            assignment tracker becomes more useful when it lets you see both the
            deadline and the work leading up to it.
          </p>
          <p>
            MyStudyPlanner helps with that by keeping assignments close to the
            rest of your study routine. You can use it to track due dates, keep
            class work visible, and add study sessions before deadlines get too
            close. If you want a uni-specific version of this workflow, the{" "}
            <Link
              href="/assignment-planner-for-university-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment planner for university students
            </Link>{" "}
            page goes deeper into that use case.
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
          How MyStudyPlanner helps you stay ahead of deadlines
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner is designed to make assignment planning feel clear.
            You can add subjects, enter upcoming due dates, and keep study
            sessions nearby so you are not only tracking what is due, but also
            when you plan to work on it. That makes it easier to spread effort
            across the week instead of leaving everything to the last minute.
          </p>
          <p>
            This is especially useful when different subjects start getting busy
            at once. An English essay, a maths task, a science report, and
            revision for a test can easily land in the same period. When that
            happens, a calm overview helps more than a busy system. You want to
            know what is urgent, what needs early progress, and what you can do
            in smaller steps now.
          </p>
          <p>
            Students often do better with a planner that is simple enough to
            update quickly. If the system feels like work on its own, it is less
            likely to stay useful during busy weeks. MyStudyPlanner keeps the
            structure focused so you can open it, understand your workload, and
            get on with the actual task.
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
            they can update anywhere.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Useful for high school and university students
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Assignment tracking matters in both high school and university, but
            the details can look different. High school students often need to
            stay on top of homework, tests, and shorter assignments across the
            week. University students usually have fewer tasks overall, but they
            are often larger, longer, and easier to leave too late.
          </p>
          <p>
            MyStudyPlanner works for both. It gives students one place to keep
            assignments visible while still fitting into a bigger study routine.
            If you want a page written more directly for school life, visit the{" "}
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
            page may be a better fit.
          </p>
          <p>
            The point is the same in both cases. When assignments are easy to
            see, they are easier to plan for. That can reduce the last minute
            rush and help your workload feel more controlled across the term or
            semester.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A simpler alternative to scattered notes and reminders
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Many students already have some kind of deadline system, but it is
            often scattered. A due date might be in your school portal, a note
            in your phone, a reminder on paper, and a study plan nowhere at all.
            That can leave you constantly checking different places just to feel
            sure you have not missed anything.
          </p>
          <p>
            MyStudyPlanner brings those pieces together into one calmer flow.
            Instead of switching between tools, you can keep assignments,
            homework, and study sessions nearby. If exam preparation tends to
            overlap with assignment deadlines for you, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page explains that side of the routine. If homework is a bigger part
            of your week, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page is also relevant.
          </p>
          <p>
            The goal is not to make study feel intense. The goal is to make your
            deadlines easier to understand and your week easier to organise.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Try the planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The demo is a simple way to see whether MyStudyPlanner fits how you
            work. You can click through the real planner with sample data and
            get a feel for the dashboard, calendar, tasks, study log, marks,
            reminders, and settings before creating an account.
          </p>
          <p>
            Then if it feels right, you can start with a free account and add
            your real subjects and deadlines. You do not need to set up
            everything perfectly to get value from it. Even a small number of
            upcoming assignments can make the next week feel clearer.
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
              What is the best assignment tracker for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best assignment tracker for students is one that keeps due
              dates, subject details, and study time together in one place.
              MyStudyPlanner helps students track assignments clearly without
              adding extra clutter or complexity.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can students keep track of assignment deadlines?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Students can keep track of assignment deadlines by using one
              planner for subjects, due dates, smaller tasks, and revision
              sessions. That makes it easier to see what is due first and avoid
              last minute rush.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for tracking university and high school
              assignments?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works for both high school and university
              students who want a calm way to organise assignments, homework,
              study sessions, and exam preparation in one place.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online assignment tracker?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. You can start with a free account and use MyStudyPlanner
              online to track assignments, deadlines, and study sessions before
              deciding whether you want premium features.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}