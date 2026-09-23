import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/demo(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/privacy(.*)",
  "/terms(.*)",
  "/refund(.*)",
  "/cookies(.*)",
  "/about(.*)",
  "/how-it-works(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
