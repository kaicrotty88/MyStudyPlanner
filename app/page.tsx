// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: "Study Planner for Students | Assignments, Exams & Study Sessions",
  description:
    "MyStudyPlanner is a calm study planner for high school and university students. Track assignments, exams, homework, study sessions and marks in one simple app.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Study Planner for Students | Assignments, Exams & Study Sessions | MyStudyPlanner",
    description:
      "A calm study planner for high school and university students. Organise assignments, exams, homework, study sessions and marks in one simple app.",
    url: "/",
    siteName: "MyStudyPlanner",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Planner for Students | Assignments, Exams & Study Sessions | MyStudyPlanner",
    description:
      "A calm study planner for high school and university students. Track assignments, exams, homework, study sessions and marks in one simple app.",
  },
};

const featureCards = [
  {
    title: "Assignments and homework",
    description:
      "Keep due dates visible and organise coursework in one place instead of across tabs, notes and screenshots.",
  },
  {
    title: "Exams and revision",
    description:
      "Track exam dates and plan study sessions so revision feels clearer and less last minute.",
  },
  {
    title: "Study sessions",
    description:
      "Plan realistic blocks of study time around what actually matters this week.",
  },
  {
    title: "Marks and progress",
    description:
      "Keep an eye on results and see where more attention might be needed.",
  },
];

const audienceCards = [
  {
    title: "For high school students",
    description:
      "Stay on top of homework, exams, assignments and weekly study without making planning feel complicated.",
    href: "/study-planner-for-high-school-students",
    anchor: "Study planner for high school students",
  },
  {
    title: "For university students",
    description:
      "Organise subjects, assignment deadlines, exam dates and study sessions across the semester.",
    href: "/study-planner-for-university-students",
    anchor: "Study planner for university students",
  },
];

const guideLinks = [
  {
    href: "/study-planner-for-university-students",
    label: "Study planner for university students",
  },
  {
    href: "/assignment-tracker-for-students",
    label: "Assignment tracker for students",
  },
  {
    href: "/exam-planner",
    label: "Exam planner",
  },
  {
    href: "/student-planner-app",
    label: "Student planner app",
  },
  {
    href: "/online-study-planner",
    label: "Online study planner",
  },
  {
    href: "/free-study-planner",
    label: "Free study planner",
  },
];

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyStudyPlanner",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Study Planner",
  operatingSystem: "Web",
  url: "https://mystudyplanner.co/",
  description:
    "MyStudyPlanner is a calm web-based study planner for high school and university students. Track assignments, exams, homework, study sessions, reminders and marks in one simple app.",
  offers: [
    {
      "@type": "Offer",
      name: "Free plan",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Premium plan",
      price: "2.99",
      priceCurrency: "USD",
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
  publisher: {
    "@type": "Organization",
    name: "MyStudyPlanner",
    url: "https://mystudyplanner.co/",
  },
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />

      <header className="mx-auto max-w-4xl text-center">
        <p className="text-sm text-muted-foreground">Calm planning for real student life</p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          A calm study planner for students
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          MyStudyPlanner is a simple study planner for high school and university students who want
          one clear place to track assignments, exams, homework, study sessions, reminders and
          marks. It is built to feel calm, easy to use, and realistic for actual student life.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        <p className="mt-4 text-sm text-muted-foreground">
          Free to start. Premium from US$2.99 per month.
        </p>
      </header>

      <section className="mt-14 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Everything students need to stay organised
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          A good student planner app should make the week feel clearer, not busier. MyStudyPlanner
          keeps the essentials in one place so you can see what is due, what needs time, and what
          is already done.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {featureCards.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-background/60 p-5">
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Plan assignments, exams and study sessions in one place
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            Most students do not need another complicated system. They need an online study planner
            that makes deadlines and study time easier to see. When assignments, homework, exams
            and study sessions all live together, it becomes much easier to plan the week
            realistically.
          </p>
          <p>
            That is the point of MyStudyPlanner. It helps students stay organised without adding
            noise. No gamification. No clutter. Just a clear study planner app built around the
            parts of student life that actually matter.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Built for high school and university students
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {audienceCards.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-5">
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.description}
              </p>
              <Link
                href={item.href}
                className="mt-4 inline-flex text-sm font-medium text-foreground transition hover:text-primary"
              >
                {item.anchor}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Try the real planner before you sign up
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>
            You can explore how the planner works before creating an account. That makes it easier
            to see whether the setup feels right for your study style.
          </p>
          <p>
            Start with the free version if you want a simple planner for students. Upgrade later if
            you want extra features around marks and insights.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted/60"
          >
            Open the demo
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted/60"
          >
            See how it works
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Explore more student planning guides
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          These pages go deeper into different parts of student planning, from keeping track of
          assignments to preparing for exams.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm md:text-base">
          {guideLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}