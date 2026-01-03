import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mystudyplanner.co";
  const now = new Date();

  // Keep it conservative: only include public routes.
  // If you have marketing pages (e.g. /about), add them here.
  const routes = ["", "/sign-in", "/sign-up"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.5,
  }));
}
