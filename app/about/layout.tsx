import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | MyStudyPlanner",
  description:
    "Learn why MyStudyPlanner was built and how it helps students plan study, assessments, and deadlines without clutter.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
