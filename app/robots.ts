import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep API and internal test endpoints out of crawl queues. Pages such as
        // /app, /demo and auth routes use meta robots noindex instead, which lets
        // search engines crawl the page and actually see the noindex directive.
        disallow: ["/api/", "/supabase-test"],
      },
    ],
    sitemap: "https://mystudyplanner.co/sitemap.xml",
  };
}
