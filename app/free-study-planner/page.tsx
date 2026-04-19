import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best free study planner for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best free study planner for students is one that helps you organise assignments, homework, exams, and study sessions in one place without feeling cluttered. MyStudyPlanner gives students a simple free way to start planning.",
      },
    },
    {
      "@type": "Question",
      name: "Can students use MyStudyPlanner for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Students can start with a free MyStudyPlanner account and use the core planner to manage subjects, assignments, homework, exams, and study sessions before deciding whether they want premium features.",
      },
    },
    {
      "@type": "Question",
      name: "What can I do with a free online study planner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A free online study planner can help you keep subjects, deadlines, homework, and revision in one place. This makes it easier to see what is coming up and plan your week with less stress.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyStudyPlanner a good free study planner for high school and university students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyStudyPlanner works well for both high school and university students who want a calm and practical way to organise study without paying upfront.",
      },
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Free Study Planner for Students | MyStudyPlanner";
  const description =
    "A free study planner for students. Organise assignments, homework, exams, and study sessions in one simple place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/free-study-planner",
    },
    openGraph: {
      title,
      description,
      url: "/free-study-planner",
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

const freeFeatures = [
  {
    title: "Organise assignments, homework, and exams",
    description:
      "Keep important study tasks together so you can see deadlines clearly instead of checking multiple places.",
  },
  {
    title: "Plan study sessions in one place",
    description:
      "Add study time alongside due dates so your week feels easier to manage and less rushed.",
  },
  {
    title: "Manage subjects and weekly workload",
    description:
      "See what each subject needs and get a better sense of how busy your week or semester really is.",
  },
  {
    title: "Save your planner with a free account",
    description:
      "Start building a real planning routine without paying upfront, then decide later if premium suits you.",
  },
];

export default function FreeStudyPlannerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <Script
        id="faq-schema-free-study-planner"
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

        <p className="text-sm text-muted-foreground">Free plan</p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Free study planner
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner gives students a free study planner for organising
          assignments, homework, exams, study sessions, and subject workload in
          one calm place. It is designed for high school and university
          students who want to get organised without paying upfront or setting
          up a complicated system.
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
          What a free study planner should help students do
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A good free study planner should help you get organised straight
            away. It should make it easier to keep track of assignments,
            homework, exams, study sessions, and subjects without asking you to
            pay first just to see whether the routine works for you. For a lot
            of students, that first step matters. You want something practical
            you can actually try with real deadlines, not just a vague promise
            about staying organised.
          </p>
          <p>
            Many students already have a half built system using notes apps,
            phone reminders, calendars, or paper lists. The problem is that
            those tools often feel scattered. A free study planner becomes more
            useful when it brings the important parts of study life together in
            one place. That way, you can tell what is due, what you should work
            on next, and how busy the week looks overall.
          </p>
          <p>
            MyStudyPlanner is designed around that kind of calm planning. It is
            not trying to overwhelm you with setup or force you into a busy
            productivity routine. It gives you a simple place to start. If you
            want a broader overview of the main product, the homepage explains
            how it works as a{" "}
            <Link
              href="/"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              study planner for students
            </Link>
            . This page focuses on what you can do when you start with the free
            plan.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {freeFeatures.map((feature) => (
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
          Why starting free helps students build a planning habit
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            Starting with a free study planner lowers the barrier to getting
            organised. You do not have to decide straight away whether a planner
            is worth paying for. Instead, you can test it with your actual
            subjects, tasks, and due dates. That is usually the best way to work
            out whether a planning system suits you, because real school and uni
            life always looks different from a neat feature list.
          </p>
          <p>
            This also helps if you have tried other planners before and stopped
            using them after a week or two. A lot of study tools either feel too
            broad or too complicated. With a free plan, you can start small. Add
            a few assignments, keep your homework visible, and plan some study
            sessions around the next exam or deadline. Even that small amount of
            structure can make your week feel clearer.
          </p>
          <p>
            MyStudyPlanner is built for that steady kind of routine. You can use
            the core planner first, then decide later whether premium features
            like marks tracking and insights would actually be useful for you.
            That keeps the decision simple. If you want to compare the product
            as an{" "}
            <Link
              href="/online-study-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              online study planner
            </Link>
            , that page explains the browser based side of the product in more
            detail.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          What students can organise on the free plan
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A free study planner should be useful for the work students actually
            deal with every week. That includes assignments, homework, revision,
            study sessions, and keeping subjects organised in one place. It is
            not enough to have a free account if the planner only works
            properly once you upgrade. The core experience still needs to feel
            practical and clear from the start.
          </p>
          <p>
            MyStudyPlanner gives students a real way to begin planning. You can
            use it to see subject workload more clearly, manage due dates, and
            keep important study tasks together. If deadlines are the part of
            student life you want to manage most carefully, the{" "}
            <Link
              href="/assignment-tracker-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              assignment tracker for students
            </Link>{" "}
            page goes deeper into that use case. If you want help with everyday
            subject work, the{" "}
            <Link
              href="/homework-planner-for-students"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              homework planner for students
            </Link>{" "}
            page is also relevant.
          </p>
          <p>
            Students who are mainly focused on exam preparation can also look at
            the{" "}
            <Link
              href="/exam-planner"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              exam planner
            </Link>{" "}
            page. The value of a free planner is that you can start using these
            parts of the system before deciding whether you need anything more
            advanced.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Good for high school and university students
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            The free plan works well for both high school and university
            students. High school students often need a simple way to stay on
            top of homework, assignments, and tests across several subjects
            every week. University students usually need to organise larger
            deadlines, more independent study, and longer semester timelines. A
            free planner is especially helpful when you want to test whether the
            routine fits your workload before paying for anything.
          </p>
          <p>
            MyStudyPlanner is flexible enough for both. It keeps the layout calm
            and clear, which matters when student life already feels busy. If
            you want a page written more directly for school students, visit the{" "}
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
            Either way, the aim stays the same. A free study planner should help
            you feel more organised without making planning feel like extra work.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          Why MyStudyPlanner feels simpler than many free productivity tools
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
          <p>
            A lot of free productivity apps are either too limited or too busy.
            Some feel more like work software than something designed for
            students. Others give you lots of features but no clear way to use
            them for actual school or uni planning. That can make it harder to
            stick with the routine once your week gets full.
          </p>
          <p>
            MyStudyPlanner is built specifically for student life. Subjects,
            due dates, study sessions, reminders, and marks all make sense
            inside the same planning flow. The layout stays calm, and the goal
            is simply to help you see what matters next. If you are also looking
            for a broader{" "}
            <Link
              href="/student-planner-app"
              className="text-foreground underline underline-offset-4 transition hover:text-primary"
            >
              student planner app
            </Link>
            , that page explains how MyStudyPlanner fits into the wider app
            category.
          </p>
          <p>
            For students in Australia especially, where school terms and uni
            semesters can get busy fast, having a planner that feels easy to
            open and easy to trust can make a real difference. The calmer the
            system feels, the more likely it is to stay useful over time.
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
            Then if it feels right, you can create a free account and start
            adding your own subjects and deadlines. You do not need to set up
            everything at once. Even a few real tasks can make the week ahead
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
              What is the best free study planner for students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              The best free study planner for students is one that helps you
              organise assignments, homework, exams, and study sessions in one
              place without feeling cluttered. MyStudyPlanner gives students a
              simple free way to start planning.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Can students use MyStudyPlanner for free?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. Students can start with a free MyStudyPlanner account and use
              the core planner to manage subjects, assignments, homework,
              exams, and study sessions before deciding whether they want
              premium features.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              What can I do with a free online study planner?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              A free online study planner can help you keep subjects, deadlines,
              homework, and revision in one place. This makes it easier to see
              what is coming up and plan your week with less stress.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              Is MyStudyPlanner a good free study planner for high school and
              university students?
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Yes. MyStudyPlanner works well for both high school and university
              students who want a calm and practical way to organise study
              without paying upfront.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}