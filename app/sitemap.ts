// app/sitemap.ts
import type { MetadataRoute } from "next";

type RouteConfig = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mystudyplanner.co";

  const routes: RouteConfig[] = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },

    { path: "/study-planner-for-university-students", priority: 0.9, changeFrequency: "monthly" },
    { path: "/assignment-tracker-for-students", priority: 0.9, changeFrequency: "monthly" },
    { path: "/exam-planner", priority: 0.9, changeFrequency: "monthly" },
    { path: "/homework-planner-for-students", priority: 0.8, changeFrequency: "monthly" },
    { path: "/marks-tracker-for-students", priority: 0.8, changeFrequency: "monthly" },
    { path: "/study-planner-for-high-school-students", priority: 0.9, changeFrequency: "monthly" },

    { path: "/online-study-planner", priority: 0.8, changeFrequency: "monthly" },
    { path: "/free-study-planner", priority: 0.7, changeFrequency: "monthly" },
    { path: "/assignment-planner-for-university-students", priority: 0.7, changeFrequency: "monthly" },
    { path: "/student-planner-app", priority: 0.9, changeFrequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}