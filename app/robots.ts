import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/how-it-works",
          "/privacy",
          "/terms",
          "/study-planner-for-university-students",
          "/assignment-tracker-for-students",
          "/exam-planner",
        ],
        disallow: ["/app", "/demo", "/sign-in", "/sign-up", "/sign-out"],
      },
    ],
    sitemap: "https://mystudyplanner.co/sitemap.xml",
  };
}