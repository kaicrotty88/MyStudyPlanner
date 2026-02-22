// app/demo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import App from "@/components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Try it now — MyStudyPlanner",
  description:
    "Try MyStudyPlanner instantly with sample data. Create an account to save and sync across devices.",
  alternates: {
    canonical: "/", // avoid treating /demo as a canonical page
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default async function DemoPage() {
  const { userId } = await auth();

  // Signed-in users shouldn't see sample mode
  if (userId) redirect("/app");

  return (
    <div className="relative">
      {/* Sample data banner */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-6 py-2 md:px-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground">
                Sample data mode
              </span>

              <span className="hidden truncate text-sm text-muted-foreground sm:block">
                You’re trying MyStudyPlanner with sample data. Create an account to save & sync.
              </span>
            </div>

            <div className="sm:hidden mt-1 text-[11px] leading-4 text-muted-foreground">
              Sample data may reset. Create an account to save & sync.
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive sample app */}
      <App mode="demo" />
    </div>
  );
}