import App from "../../components/App";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  // Protect the real app
  if (!userId) {
    redirect("/sign-in");
  }

  return <App mode="app" />;
}
