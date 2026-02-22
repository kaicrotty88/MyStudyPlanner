// File: app/demo/page.tsx
import type { Metadata } from "next";
import App from "@/components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Try it now — MyStudyPlanner",
  description: "Try MyStudyPlanner instantly with sample data. Create an account to save and sync across devices.",
  alternates: {
    canonical: "/demo",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default async function DemoPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return <App mode="demo" />;
}