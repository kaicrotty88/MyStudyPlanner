import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mystudyplanner.co";
  const now = new Date();

  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },

    { path: "/study-planner-for-university-students", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/assignment-tracker-for-students", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/exam-planner", priority: 0.9, changeFrequency: "monthly" as const },

    { path: "/homework-planner-for-students", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/marks-tracker-for-students", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/study-planner-for-high-school-students", priority: 0.9, changeFrequency: "monthly" as const },

    { path: "/online-study-planner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/free-study-planner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/assignment-planner-for-university-students", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/student-planner-app", priority: 0.8, changeFrequency: "monthly" as const },

    { path: "/sign-in", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/sign-up", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}