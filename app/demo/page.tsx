import type { Metadata } from "next";
import App from "@/components/App";

export const metadata: Metadata = {
  title: "Try it now - MyStudyPlanner",
  description: "Try MyStudyPlanner instantly with sample data. Create an account to save and sync across devices.",
  alternates: { canonical: "/demo" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default async function DemoPage() {
  return <App mode="demo" />;
}
