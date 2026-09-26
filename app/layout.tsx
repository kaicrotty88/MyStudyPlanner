import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import CookieConsent from "@/components/CookieConsent";
import ConsentAnalytics from "@/components/ConsentAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = "Study Planner for Students | MyStudyPlanner";
const defaultDescription =
  "Plan assignments, exams and study sessions in one calm online student planner. Keep your calendar, tasks, preparation and results connected.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: {
    default: defaultTitle,
    template: "%s | MyStudyPlanner",
  },
  description: defaultDescription,
  applicationName: "MyStudyPlanner",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "MyStudyPlanner",
    title: defaultTitle,
    description: defaultDescription,
    locale: "en_AU",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MyStudyPlanner study planner for students" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#7A9B7F",
              colorBackground: "#FAFAF9",
              colorText: "#2D2D2D",
              colorInputBackground: "#F9F9F8",
              borderRadius: "12px",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "rounded-2xl border border-border bg-card shadow-sm",
              cardBox: "w-full",
              rootBox: "w-full",
              main: "w-full",
              headerTitle:
                "text-foreground text-lg font-semibold tracking-tight",
              headerSubtitle: "text-muted-foreground text-sm",
              formFieldLabel: "text-foreground text-sm font-medium",
              formFieldInput:
                "bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:opacity-95 rounded-xl h-10",
              footerActionLink: "text-primary hover:opacity-90",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-xs",
              userButtonTrigger:
                "rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30",
              userButtonPopoverCard:
                "rounded-2xl border border-border bg-card shadow-sm",
              userButtonPopoverActionButton: "hover:bg-muted rounded-lg",
              userButtonPopoverActionButtonText: "text-foreground",
            },
          }}
        >
          {children}
          <ConsentAnalytics />
          <CookieConsent />
        </ClerkProvider>
      </body>
    </html>
  );
}
