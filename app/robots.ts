import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/app"],
        disallow: ["/demo", "/sign-in", "/sign-up", "/sign-out"],
      },
    ],
    sitemap: "https://mystudyplanner.co/sitemap.xml",
  };
}
