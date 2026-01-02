import App from "../components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  // Signed-in users shouldn't see the demo
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="relative">
      {/* Demo banner + CTAs */}
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-full bg-accent text-foreground border border-border">
              Demo mode
            </span>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Explore the app with sample data. Save your own after you sign in.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sign-in"
              className="px-3 py-2 rounded-lg text-foreground hover:bg-muted transition"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
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
