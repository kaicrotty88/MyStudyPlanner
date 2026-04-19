import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Feature = {
  icon: string;
  title: string;
  description: string;
  premium?: boolean;
};

type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};

const features: Feature[] = [
  {
    icon: "📅",
    title: "Calendar view",
    description:
      "See assignments, exams, homework, and study sessions in one clear calendar organised by subject.",
  },
  {
    icon: "✓",
    title: "Tasks and deadlines",
    description:
      "Keep upcoming work in one place so important due dates do not get lost across different apps.",
  },
  {
    icon: "⏱",
    title: "Study log",
    description:
      "Log study sessions quickly and connect them to the subject or assignment you are working on.",
  },
  {
    icon: "📊",
    title: "Marks tracking",
    description:
      "Record results and keep a simple view of how each subject is going over time.",
    premium: true,
  },
  {
    icon: "↗",
    title: "Insights",
    description:
      "See study patterns, subject progress, and useful summaries without extra clutter.",
    premium: true,
  },
  {
    icon: "🔔",
    title: "Reminders",
    description:
      "Add everyday reminders for things like emails, packing, forms, or errands.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "I wanted something simpler than Notion and more focused than a normal calendar. This feels calm and easy to keep up with.",
    name: "Aisha R.",
    detail: "Year 12 student, Sydney",
  },
  {
    quote:
      "I use it for weekly planning and assignment dates. The study log helps me see where my time is actually going.",
    name: "James T.",
    detail: "University student, Melbourne",
  },
  {
    quote:
      "It is one of the few study apps that does not feel busy. I can open it quickly and know what I need to do next.",
    name: "Priya K.",
    detail: "Year 11 student, Brisbane",
  },
];

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyStudyPlanner",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Study Planner",
  operatingSystem: "Web",
  url: "https://mystudyplanner.co",
  description:
    "MyStudyPlanner is a calm online study planner for students. Track assignments, homework, exams, study sessions, marks, and reminders in one place.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      url: "https://mystudyplanner.co/sign-up",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "2.99",
      priceCurrency: "USD",
      url: "https://mystudyplanner.co/sign-up",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "2.99",
        priceCurrency: "USD",
        billingDuration: 1,
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
  ],
  creator: {
    "@type": "Organization",
    name: "MyStudyPlanner",
    url: "https://mystudyplanner.co",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Study Planner for Students | MyStudyPlanner";
  const description =
    "A calm online study planner for students. Track assignments, homework, exams, study sessions, and marks in one simple place.";

  return {
    metadataBase: new URL("https://mystudyplanner.co"),
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "/",
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

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-background">
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />

      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">
              MyStudyPlanner
            </span>
            <span className="text-[11px] text-muted-foreground">
              Built for student life
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 sm:inline-flex"
            >
              Create free account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl md:top-12 md:h-80 md:w-80" />
          </div>

          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:px-10 md:py-24">
            <div className="inline-flex items-center rounded-full border border-[#D7E4D9] bg-[#F7FAF7] px-3 py-1 text-xs font-medium text-[#5E7A63]">
              Calm planning for school and uni
            </div>

            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
              A simple study planner for students who want everything in one
              place
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-7 text-muted-foreground md:text-lg md:leading-8">
              MyStudyPlanner is an online study planner for students who want a
              clear way to manage assignments, homework, exams, study sessions,
              marks, and reminders without turning planning into a second job.
              It is built for high school and university students who prefer a
              calm layout, simple structure, and a planner that is easy to keep
              using throughout the semester.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Free to start. Premium from{" "}
              <span className="font-medium text-foreground">US$2.99/month</span>.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Why students use MyStudyPlanner
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Many students try to manage study with a mix of notes apps,
                calendars, reminders, and spreadsheets. That can work for a
                while, but it often becomes messy once assignments, exams, and
                weekly study sessions start stacking up. MyStudyPlanner gives
                you one place to see what is due, what you should work on next,
                and how your term is looking overall.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                The goal is not to gamify your day or fill your screen with
                widgets. The goal is to help you feel organised and a little
                less mentally crowded. You can add tasks, plan study blocks, log
                what you have done, and keep track of results with a layout that
                feels steady and easy to return to. If you are looking for a{" "}
                <Link
                  href="/student-planner-app"
                  className="text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  student planner app
                </Link>{" "}
                that stays simple, this is where MyStudyPlanner fits.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    {feature.premium ? (
                      <span className="rounded-full bg-[#E8F0E9] px-2.5 py-1 text-[11px] font-semibold text-[#5E7A63]">
                        Premium
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                One planner for assignments, exams, and weekly study
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                A good study planner for students should help with everyday work
                as well as the bigger deadlines that shape a term. That means
                being able to track homework, stay ahead of assignments, plan
                revision before exams, and review your marks without jumping
                between different tools. MyStudyPlanner is designed around that
                real student routine.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                If you mainly need help managing due dates, you can explore the{" "}
                <Link
                  href="/assignment-tracker-for-students"
                  className="text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  assignment tracker for students
                </Link>{" "}
                page. If exam periods are where things usually feel heavy, take
                a look at the{" "}
                <Link
                  href="/exam-planner"
                  className="text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  exam planner
                </Link>{" "}
                guide. Students who want a no cost way to get started can also
                read about the{" "}
                <Link
                  href="/free-study-planner"
                  className="text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  free study planner
                </Link>{" "}
                option. These pages explain different use cases, but the core
                idea stays the same: one calm system that helps you stay on top
                of study without extra noise.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Because it runs in the browser, MyStudyPlanner also works well
                as an{" "}
                <Link
                  href="/online-study-planner"
                  className="text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  online study planner
                </Link>{" "}
                that you can open from anywhere. You do not need a complicated
                setup to get started. Add your subjects, enter upcoming work,
                and begin planning from there.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Built for high school and university students
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                  Student life looks different depending on where you are
                  studying. High school students often need a clear homework and
                  exam routine, while university students usually manage more
                  independent scheduling across lectures, tutorials, readings,
                  and major assessments. MyStudyPlanner is flexible enough for
                  both, while keeping the same simple structure.
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                  If you are at school and want something that feels easy to use
                  every day, visit the{" "}
                  <Link
                    href="/study-planner-for-high-school-students"
                    className="text-foreground underline underline-offset-4 transition hover:text-primary"
                  >
                    study planner for high school students
                  </Link>{" "}
                  page. If you are at uni and need a better way to keep track of
                  longer assignments and shifting deadlines, the{" "}
                  <Link
                    href="/study-planner-for-university-students"
                    className="text-foreground underline underline-offset-4 transition hover:text-primary"
                  >
                    study planner for university students
                  </Link>{" "}
                  page is a good place to start. You can also use marks tracking
                  to review results over time on the{" "}
                  <Link
                    href="/marks-tracker-for-students"
                    className="text-foreground underline underline-offset-4 transition hover:text-primary"
                  >
                    marks tracker for students
                  </Link>{" "}
                  page.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
                <h3 className="text-xl font-semibold text-foreground">
                  Try the real planner before signing up
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                  The demo lets you explore the actual layout and see how the
                  planner works with sample subjects, tasks, and study data. It
                  is a simple way to decide whether the structure feels right
                  for you before creating an account.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                    No account needed
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                    Sample planner data
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                    Real product preview
                  </span>
                </div>

                <Link
                  href="/demo"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Open the demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                What students are saying
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <p className="text-sm leading-7 text-foreground">
                    “{testimonial.quote}”
                  </p>
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  What is the best study planner for students?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  The best study planner for students is one that is easy to use
                  consistently. For most students, that means having assignments,
                  homework, exams, study sessions, and reminders in one place.
                  MyStudyPlanner is designed around that simple idea, so you can
                  stay organised without feeling overloaded by features.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Is MyStudyPlanner good for university students?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. University students can use MyStudyPlanner to keep track
                  of large assignments, revision periods, weekly study blocks,
                  and subject results. The layout works well when you need a
                  clear overview of the term but still want something simple to
                  update each day.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Can I use MyStudyPlanner as a free online study planner?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. You can start with a free account and use the planner in
                  your browser as an online study planner. That makes it easy to
                  manage subjects, due dates, and study sessions from one place
                  before deciding whether you want premium features later.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Does MyStudyPlanner track assignments and exam dates?
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Yes. MyStudyPlanner helps students track assignment deadlines,
                  homework, study sessions, and exam dates together. This is
                  useful when you want to see both your upcoming work and your
                  revision plan in the same planner instead of splitting them
                  across different tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-14 text-center md:px-10 md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Start planning with less clutter
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Try the demo to see how MyStudyPlanner works, or create a free
              account and begin with your subjects, tasks, and upcoming due
              dates today.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Try the demo first
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60"
              >
                Create free account
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MyStudyPlanner
            </div>

            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/about"
                className="text-muted-foreground transition hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/how-it-works"
                className="text-muted-foreground transition hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}