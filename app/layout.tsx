// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalyticsPageView from "@/components/GoogleAnalyticsPageView";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-1ZLJMK2TLL";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mystudyplanner.co"),
  title: {
    default: "Study Planner for Students | Assignments, Exams & Study Sessions | MyStudyPlanner",
    template: "%s | MyStudyPlanner",
  },
  description:
    "MyStudyPlanner is a calm study planner for high school and university students. Track assignments, exams, homework, study sessions and marks in one simple app.",
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
    url: "https://mystudyplanner.co/",
    siteName: "MyStudyPlanner",
    title: "Study Planner for Students | Assignments, Exams & Study Sessions | MyStudyPlanner",
    description:
      "MyStudyPlanner is a calm study planner for high school and university students. Track assignments, exams, homework, study sessions and marks in one simple app.",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Planner for Students | Assignments, Exams & Study Sessions | MyStudyPlanner",
    description:
      "MyStudyPlanner is a calm study planner for high school and university students. Track assignments, exams, homework, study sessions and marks in one simple app.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
          `}
        </Script>

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
              headerTitle: "text-foreground text-lg font-semibold tracking-tight",
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
              userButtonPopoverCard: "rounded-2xl border border-border bg-card shadow-sm",
              userButtonPopoverActionButton: "hover:bg-muted rounded-lg",
              userButtonPopoverActionButtonText: "text-foreground",
            },
          }}
        >
          <Suspense fallback={null}>
            <GoogleAnalyticsPageView />
          </Suspense>

          {children}
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}