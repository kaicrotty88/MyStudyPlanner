import { redirect } from "next/navigation";

export default function Page() {
  // Clerk handles sign out on this endpoint; after sign out it returns you to /sign-in
  redirect("/sign-in?__clerk_sign_out=1");
}
