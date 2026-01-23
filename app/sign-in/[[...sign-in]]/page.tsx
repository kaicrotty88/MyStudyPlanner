import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import Link from "next/link";

export default function Page() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep everything in sync.">
      <div className="clerk-embed">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              // ✅ Prevent any horizontal clipping of Clerk’s internal badges (like “Last used”)
              // and make sure the card’s contents can breathe on the right edge.
              card: "!overflow-visible !bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full",
              cardBox:
                "!overflow-visible !bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full",
              main: "w-full !overflow-visible",

              headerTitle: "hidden",
              headerSubtitle: "hidden",

              socialButtonsBlockButton:
                "!h-10 !rounded-xl !border !border-gray-200 !bg-white hover:!bg-gray-50 transition !px-4",
              socialButtonsBlockButtonText: "text-sm text-gray-700",

              // ✅ Give the social area a tiny bit of horizontal padding so the badge never hits the edge
              socialButtonsBlock: "!px-1",

              dividerLine: "bg-gray-200",
              dividerText: "text-xs text-gray-500",

              formFieldLabel: "text-sm font-medium text-gray-800",
              formFieldInput:
                "!h-10 !rounded-xl !border !border-gray-200 !bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(122,155,127,0.25)]",

              formButtonPrimary:
                "!h-10 !rounded-xl !bg-[#7A9B7F] !text-white hover:opacity-95 transition",

              footerActionLink: "text-[#7A9B7F] hover:opacity-90",
              footer: "!hidden",
            },
          }}
        />

        {/* Switch */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#7A9B7F] hover:opacity-90 transition"
          >
            Create an account
          </Link>
        </div>

        {/* Small legit footer */}
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground/80">
          <Link href="/privacy" className="hover:text-muted-foreground transition">
            Privacy
          </Link>
          <span className="opacity-60">•</span>
          <Link href="/terms" className="hover:text-muted-foreground transition">
            Terms
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
