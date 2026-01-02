import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function Page() {
  return (
    <AuthShell title="Create your account" subtitle="Get more organised than ever.">
      <div className="clerk-embed">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full",
              cardBox:
                "!bg-transparent !shadow-none !border-0 !p-0 !m-0 !rounded-none w-full",
              main: "w-full",

              headerTitle: "hidden",
              headerSubtitle: "hidden",

              socialButtonsBlockButton:
                "!h-10 !rounded-xl !border !border-gray-200 !bg-white hover:!bg-gray-50 transition",
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
      </div>
    </AuthShell>
  );
}
