import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyStudyPlanner",
  description: "Made by students, for students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
          /* ---- Make Clerk card match your cards ---- */
          card: "rounded-2xl border border-border bg-card shadow-sm",
          cardBox: "w-full",
          rootBox: "w-full",
          main: "w-full",

          /* ---- Titles ---- */
          headerTitle: "text-foreground text-lg font-semibold tracking-tight",
          headerSubtitle: "text-muted-foreground text-sm",

          /* ---- Inputs ---- */
          formFieldLabel: "text-foreground text-sm font-medium",
          formFieldInput:
            "bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",

          /* ---- Buttons ---- */
          formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-95 rounded-xl h-10",

          /* ---- Links / dividers ---- */
          footerActionLink: "text-primary hover:opacity-90",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground text-xs",

          /* ---- UserButton styling so it matches your nav ---- */
          userButtonTrigger: "rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30",
          userButtonPopoverCard: "rounded-2xl border border-border bg-card shadow-sm",
          userButtonPopoverActionButton: "hover:bg-muted rounded-lg",
          userButtonPopoverActionButtonText: "text-foreground",
        },
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
