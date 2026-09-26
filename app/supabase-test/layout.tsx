import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal test",
  robots: { index: false, follow: false },
};

export default function SupabaseTestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
