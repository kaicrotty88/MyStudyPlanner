import type { Metadata } from "next";
import App from "../../components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    absolute: "MyStudyPlanner",
  },
  description:
    "Plan your classes, tasks, study sessions and marks in MyStudyPlanner.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  return <App mode="app" />;
}