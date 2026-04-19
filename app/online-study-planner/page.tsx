import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best online study planner for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best online study planner for students is one that keeps assignments, homework, exams, and study sessions in one place without feeling cluttered. MyStudyPlanner is designed to give students a calm and simple online planning routine.",
      },
    },
    {
      "@type": "Question",
      name: "How can an online study planner help students stay organised?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An online study planner helps students stay organised by keeping subjects, due dates, study sessions, and reminders together in one place. This makes it easier to see what is coming up and plan the week more clearly.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner good for high school and university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works well for both high school and university students who want a practical online planner for assignments, homework, exams, and study time.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use MyStudyPlanner as a free online study planner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a free account and use MyStudyPlanner online to organise subjects, assignments, homework, and study sessions before deciding whether you want premium features.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Online Study Planner for Students | MyStudyPlanner";
  const description =
    "A calm online study planner for students. Organise assignments, homework, exams, and study sessions in one place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/online-study-planner",
    },
    openGraph: {
      title,
      description,
      url: "/online-study-planner",
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
    title: "Access your planner online",
    description:
      "Open your study planner in the browser and keep your workload visible without relying on paper notes or scattered apps.",
  },
  {
    title: "Keep deadlines in one place",
    description:
      "See assignments, homework, exam dates, and study sessions together so your week feels clearer.",
  },
  {
    title: "Update plans quickly",
    description:
      "Add subjects, tasks, and reminders as things change without turning planning into a complicated setup.",
  },
  {
    title: "Stay organised with less clutter",
    description:
      "Use a calmer online planner that helps you focus on your real workload instead of extra visual noise.",
  },
];

export default function OnlineStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-online-study-planner"
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

        <p className="text-sm text-muted-foreground">Online planning</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Online study planner
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is an online study planner for students who want one
          place to organise assignments, homework, exams, study sessions,
          reminders, and subject workload. It is built for high school and
          university students who want a calm digital planner that feels simple
          to use and easy to keep up with.
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
          Why students look for an online study planner
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of students want an online study planner because their work is
            already spread across digital spaces. Assignment details might be on
            a school portal, exam dates in a calendar, reminders in a phone, and
            class notes somewhere else again. Even when each tool is useful on
            its own, the full study routine can still feel scattered. That makes
            it harder to know what is actually due, what needs early attention,
            and how busy the week really is.
          </p>
          <p>
            An online study planner helps by bringing those moving parts
            together. Instead of relying on memory or checking multiple places,
            you can keep your subjects, tasks, deadlines, and study sessions in
            one planner. That gives you a clearer view of your workload and
            makes it easier to plan calmly. For many students, that clarity is
            the main benefit. It is not about doing more. It is about feeling
            less mentally crowded.
          </p>
          <p>
            MyStudyPlanner is designed around that kind of everyday student
            planning. It is not trying to be a busy productivity platform. It
            is an online study planner that helps students stay organised in a
            way that feels steady and practical. If you want the broader product
            overview, the homepage explains how it works as a{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for students
            </Link>
            . This page focuses on why the online format works so well.
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
          What makes an online study planner useful
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A useful online study planner needs to do more than store a list of
            tasks. Students usually need to keep track of subjects, assignments,
            homework, exam dates, revision, reminders, and sometimes marks as
            well. The planner becomes genuinely helpful when those pieces sit
            together in a way that is easy to understand at a glance.
          </p>
          <p>
            It also helps when the planner is easy to update. Student workloads
            change quickly. A teacher adds homework, an assignment date shifts,
            or a uni subject posts a new task. If your planner is hard to keep
            current, it becomes less useful right when you need it most. An
            online study planner should make it easy to add what matters and
            move on with your day.
          </p>
          <p>
            MyStudyPlanner is built for that kind of routine. You can keep
            important study information together without needing a complicated
            setup. If you are also comparing apps in a broader sense, the{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>{" "}
            page explains how MyStudyPlanner fits into that category too.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          How MyStudyPlanner helps students stay organised online
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            MyStudyPlanner gives students a simple online space to organise
            study. You can add subjects, enter assignments, keep homework
            visible, plan study sessions, and organise exam dates without
            turning planning into another big project. That matters because a
            lot of students do not need more features. They need more clarity.
          </p>
          <p>
            This is especially helpful during busy weeks. When several deadlines
            overlap, being able to open one online planner and see everything in
            one place can make the workload feel more manageable. Instead of
            bouncing between apps, you can quickly check what is due, what you
            planned to work on, and what needs attention next.
          </p>
          <p>
            Because the planner is online, it suits students who prefer a
            browser based workflow and want something easy to access without a
            complicated setup. It is a straightforward way to keep your planning
            digital while still feeling calm and student focused.
          </p>
          <p>
            If deadlines are your main issue, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page goes deeper into that. If regular class tasks are a bigger part
            of your week, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page is also useful.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for high school and university students
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            An online study planner can be helpful at both high school and
            university, but the workload often looks a little different. High
            school students usually need to stay on top of homework, test dates,
            and assignments across several subjects each week. University
            students often have fewer but larger deadlines, more independent
            study, and longer semester timelines. A good online planner needs to
            work for both without becoming cluttered.
          </p>
          <p>
            MyStudyPlanner fits both types of routine. It gives students one
            calm place to organise what is coming up and what they want to work
            on next. If you want a page written more directly for school life,
            visit the{" "}
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
            In both cases, the online format helps because it keeps the planner
            easy to access and simple to maintain. The less friction there is,
            the easier it is to keep using the planner during busy parts of term
            or semester.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          A calm alternative to cluttered productivity tools
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Many digital planning tools are either too general or too busy. Some
            are built more for work tasks than student life. Others are packed
            with widgets, streaks, or complicated systems that make planning
            feel like its own separate job. That can make them hard to stick
            with once your actual workload gets full.
          </p>
          <p>
            MyStudyPlanner is different because it stays focused on student
            needs. Assignments, homework, study sessions, exams, reminders, and
            marks all make sense within the same planner. The layout stays calm,
            which helps students focus on what matters instead of getting pulled
            into extra noise.
          </p>
          <p>
            If you also want to read about starting without paying, the{" "}
            <Link
              href="/free-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              free study planner
            </Link>{" "}
            page explains that option. If exam periods are where things usually
            feel most intense, the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page is also relevant.
          </p>
          <p>
            The goal is not to make study feel more serious than it already is.
            The goal is to make your study routine easier to understand.
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
            your own subjects and deadlines. You do not need a perfect setup on
            day one. Even a few real tasks can make the week feel more clear and
            manageable.
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
              What is the best online study planner for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best online study planner for students is one that keeps
              assignments, homework, exams, and study sessions in one place
              without feeling cluttered. MyStudyPlanner is designed to give
              students a calm and simple online planning routine.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              How can an online study planner help students stay organised?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              An online study planner helps students stay organised by keeping
              subjects, due dates, study sessions, and reminders together in one
              place. This makes it easier to see what is coming up and plan the
              week more clearly.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner good for high school and university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works well for both high school and university
              students who want a practical online planner for assignments,
              homework, exams, and study time.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can I use MyStudyPlanner as a free online study planner?
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