import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description:
    "A calm study planner for high-school students who want clarity, not clutter.",
  alternates: { canonical: "/" },
};

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold text-foreground">
            MyStudyPlanner
          </span>

          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex min-h-screen items-center">
        <section className="mx-auto w-full max-w-5xl px-6 pt-16">
          <div className="max-w-3xl">
            <h1 className="text-[2.75rem] font-semibold tracking-tight text-foreground leading-[1.05] md:text-[3.5rem]">
              Study planning,
              <br />
              without the chaos.
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              A calm planner built for high-school students who want clarity,
              focus, and control over their workload.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/demo"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
              >
                Try the demo
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
