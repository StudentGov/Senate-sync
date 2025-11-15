import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 🚧 DEVELOPMENT MODE: Control Clerk authentication via environment variable
// Set DISABLE_AUTH_FOR_DEV=true in .env.local to disable auth in development
const DISABLE_AUTH_FOR_DEV = process.env.DISABLE_AUTH_FOR_DEV === 'true';

// Define protected routes using route matcher
// These routes require authentication and role-based authorization
const isProtectedRoute = createRouteMatcher([
  "/student(.*)",
  "/attorney(.*)",
  "/senate(.*)",
  "/dashboard(.*)",
  "/admin(.*)"
]);

/**
 * Middleware for role-based access control.
 * This middleware protects routes by verifying user roles
 * using Clerk session claims and redirects unauthorized users.
 */
export default clerkMiddleware(async (auth, req) => {
  // Skip authentication in development mode
  if (DISABLE_AUTH_FOR_DEV) {
    console.log("⚠️ DEV MODE: Authentication disabled");
    return NextResponse.next();
  }
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  // Public paths that should bypass Clerk protections (e.g. onboarding pages)
  // Note: remove `/senate/log-hours` from public paths so hour logging requires authentication
  const publicPaths = ["/api/voting"];

  // If the request is for a public path, skip protection and allow next()
  if (publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  // Redirect to sign-in if the user is not authenticated and trying to access a protected route
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // Get user role from session claims (stored in Clerk publicMetadata)
  const userRole = sessionClaims?.role;
  console.log("User Role from Session:", userRole);

  /**
   * Admin Access Control:
   * Admins are allowed to access all routes without restriction.
   */
  if (userRole === "admin") {
    console.log("Admin Access Granted - Full Access");
    return NextResponse.next();
  }

  /**
   * Attorney Access Control:
   * Attorneys can access attorney-specific routes.
   */
  if (userRole === "attorney" && req.nextUrl.pathname.startsWith("/attorney")) {
    console.log("Attorney Access Granted");
    return NextResponse.next();
  }

  /**
   * Role-Based Access Control:
   * Maps each role to its respective directory.
   * Only users with the corresponding role can access these directories.
   */
  const roleBasedRoutes = {
    attorney: "/attorney",
    senator: "/senate",
    coordinator: "/coordinator"
    // Note: admin has full access (handled above)
  };

  /**
   * Senate Access Control:
   * Senators are allowed to access /senate.
   */
  if (
    isProtectedRoute(req) &&
    req.nextUrl.pathname.startsWith("/senate") &&
    userRole === "senator"
  ) {
    return NextResponse.next();
  }

  /**
   * General Role-Based Access Validation:
   * Checks each route against the user's role.
   * Redirects to /unauthorized if the user does not have permission.
   */
  for (const [role, path] of Object.entries(roleBasedRoutes)) {
    if (
      isProtectedRoute(req) && 
      req.nextUrl.pathname.startsWith(path) && 
      userRole !== role
    ) {
      console.log(`Unauthorized access to ${path} by ${userRole}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Allow access if all checks pass
  return NextResponse.next();
});

/**
 * Middleware Configuration:
 * Specifies which routes are protected and require role-based access control.
 */
export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/student/:path*", // Allow attorneys to access /student
    "/attorney/:path*",
    "/senate/:path*",
    "/dashboard/:path*",
    "/forum/:path*",
    "/admin/:path*"
  ],
};
