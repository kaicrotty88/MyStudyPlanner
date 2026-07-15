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
              rootBox: "w-full !overflow-visible",
              card: "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full !overflow-visible",
              cardBox:
                "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full !overflow-visible",
              main: "w-full !overflow-visible",

              headerTitle: "hidden",
              headerSubtitle: "hidden",

              socialButtonsBlockButton:
                "!h-10 !rounded-xl !border !border-gray-200 !bg-white hover:!bg-gray-50 transition !overflow-visible !pr-20",
              socialButtonsBlockButtonText: "text-sm text-gray-700",

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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#7A9B7F] transition hover:opacity-90"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground/80">
          <Link href="/privacy" className="transition hover:text-muted-foreground">
            Privacy
          </Link>
          <span className="opacity-60">•</span>
          <Link href="/terms" className="transition hover:text-muted-foreground">
            Terms
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}