import type { Metadata } from "next";
import App from "@/components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Demo",
  description: "Explore MyStudyPlanner with sample data.",
  alternates: {
    canonical: "/demo",
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

  // Signed-in users shouldn't see the demo
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="relative">
      {/* Demo banner + CTAs */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border bg-accent px-2 py-1 text-xs text-foreground">
              Demo mode
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">
              Explore the app with sample data. Save your own after you sign in.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-95 transition"
            >
              Create account
            </a>
          </div>
        </div>
      </div>

      {/* Interactive demo app */}
      <App mode="demo" />
    </div>
  );
}
