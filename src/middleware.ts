import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/student(.*)",
  "/attorney(.*)",
  "/senate(.*)",
  "/dashboard(.*)",
  "/forum(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  const userRole = sessionClaims?.role;

  // Define role-based access control
  const roleBasedRoutes: Record<string, string> = {
    student: "/student",
    attorney: "/attorney",
    senate_speaker: "/senate/speaker",
    senate_member: "/senate",
  };

  // Super Admin can access everything
  if (userRole === "super_admin") {
    return NextResponse.next();
  }

  for (const [role, path] of Object.entries(roleBasedRoutes)) {
    if (isProtectedRoute(req) && req.nextUrl.pathname.startsWith(path) && userRole !== role) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/student/:path*",
    "/attorney/:path*",
    "/senate/:path*",
    "/dashboard/:path*",
    "/forum/:path*",
  ],
};
