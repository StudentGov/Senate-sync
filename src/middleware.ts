import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Set DISABLE_AUTH_FOR_DEV=true to disable auth in development
const DISABLE_AUTH_FOR_DEV = false;

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

/**
 * Public Page Routes
 * These pages are accessible to everyone (authenticated or not)
 */
const PUBLIC_PAGE_ROUTES = [
  "/",
  "/calendar",
  "/resources",
  "/archives",
  "/voting",
  "/student(.*)",
  "/attorney",
  "/unauthorized",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/redirect",
];

/**
 * Public API Routes
 * These API endpoints don't require authentication
 * Student booking APIs are public - there is no "student" role
 */
const PUBLIC_API_ROUTES = [
  "/api/get-events",
  "/api/get-archives",
  "/api/get-resources",
  "/api/voting/list",
  "/api/voting/public(.*)",
  "/api/student(.*)",
  "/api/get-availability",
];

// Create route matchers for public routes
const isPublicPageRoute = createRouteMatcher(PUBLIC_PAGE_ROUTES);
const isPublicApiRoute = createRouteMatcher(PUBLIC_API_ROUTES);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

/**
 * Protected Page Routes by Role
 * Maps roles to the page routes they can access
 */
const PROTECTED_PAGE_ROUTES: Record<string, string[]> = {
  admin: [
    "/admin(.*)",
    "/senate(.*)",
    "/attorney/dashboard(.*)", // Only dashboard is protected, not /attorney itself
    "/coordinator(.*)",
  ],
  senator: [
    "/senate(.*)",
  ],
  attorney: [
    "/attorney/dashboard(.*)", // Only dashboard is protected, not /attorney itself
  ],
  coordinator: [
    "/senate(.*)", // Coordinators have same page access as senators
  ],
};

/**
 * Protected API Routes by Role
 * Maps roles to the API routes they can access
 */
const PROTECTED_API_ROUTES: Record<string, string[]> = {
  admin: [
    // User management
    "/api/create-user",
    "/api/update-user-role",
    "/api/delete-user",
    "/api/batch-update-roles",
    "/api/get-all-users",
    "/api/get-user-metadata",
    // Admin dashboard
    "/api/admin(.*)",
    // Content management (full access)
    "/api/add-event",
    "/api/update-event",
    "/api/delete-event",
    "/api/add-archive",
    "/api/update-archive",
    "/api/delete-archive",
    "/api/add-resource",
    "/api/update-resource",
    "/api/delete-resource",
    // Agenda-Voting (agendas and voting system)
    "/api/add-agenda",
    "/api/get-agendas",
    "/api/update-agenda-visibility",
    "/api/voting(.*)",
    "/api/get-vote",
    "/api/get-vote-count",
    "/api/get-individual-votes",
    "/api/update-user-vote",
    "/api/handle-close",
    // Senate
    "/api/senate(.*)",
    // Attorney
    "/api/attorney(.*)",
    "/api/get-booked-appointments",
    "/api/add-availability",
    "/api/delete-availability",
  ],
  senator: [
    // Senate-specific
    "/api/senate(.*)",
    // Agenda-Voting (agendas and voting system)
    "/api/get-agendas",
    "/api/voting(.*)",
    "/api/get-vote",
    "/api/get-vote-count",
    "/api/get-individual-votes",
    "/api/update-user-vote",
    // Events (read-only)
    "/api/get-events",
  ],
  attorney: [
    // Attorney-specific
    "/api/get-availability",
    "/api/get-booked-appointments",
    "/api/add-availability",
    "/api/delete-availability",
  ],
  coordinator: [
    // Senate-specific
    "/api/senate(.*)",
    // Agenda-Voting (agendas and voting system)
    "/api/get-agendas",
    "/api/add-agenda",
    "/api/update-agenda-visibility",
    "/api/voting(.*)",
    "/api/get-vote",
    "/api/get-vote-count",
    "/api/get-individual-votes",
    "/api/update-user-vote",
    "/api/handle-close",
    // Events/Calendar
    "/api/get-events",
    "/api/add-event",
    "/api/update-event",
    "/api/delete-event",
    // Archives (edit permissions)
    "/api/add-archive",
    "/api/update-archive",
    "/api/delete-archive",
    // Resources (edit permissions)
    "/api/add-resource",
    "/api/update-resource",
    "/api/delete-resource",
  ],
};

// Create route matchers for protected routes by role
const protectedRouteMatchers: Record<string, ReturnType<typeof createRouteMatcher>> = {};
const protectedApiRouteMatchers: Record<string, ReturnType<typeof createRouteMatcher>> = {};

// Initialize route matchers for each role
Object.keys(PROTECTED_PAGE_ROUTES).forEach((role) => {
  protectedRouteMatchers[role] = createRouteMatcher(PROTECTED_PAGE_ROUTES[role]);
});

Object.keys(PROTECTED_API_ROUTES).forEach((role) => {
  protectedApiRouteMatchers[role] = createRouteMatcher(PROTECTED_API_ROUTES[role]);
});

// General protected route matcher: any route that appears in any role's allowed routes
// This collects all protected routes from PROTECTED_PAGE_ROUTES
const allProtectedRoutes = new Set<string>();
Object.values(PROTECTED_PAGE_ROUTES).forEach((routes) => {
  routes.forEach((route) => allProtectedRoutes.add(route));
});
const isProtectedRoute = createRouteMatcher(Array.from(allProtectedRoutes));

// ============================================
// MIDDLEWARE LOGIC
// ============================================

/**
 * Middleware for role-based access control.
 * This middleware protects both page routes and API routes by verifying user roles
 * using Clerk session claims. Returns JSON for API routes, redirects for pages.
 */
export default clerkMiddleware(async (auth, req) => {
  // Development mode bypass
  if (DISABLE_AUTH_FOR_DEV) {
    console.log("⚠️ DEV MODE: Authentication disabled");
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api');

  // STEP 1: Check if route is public
  if (isPublicPageRoute(req) || isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // STEP 2: Authentication check
  // If route is protected, user must be authenticated
  const needsAuth = isProtectedRoute(req) || (isApiRoute && !isPublicApiRoute(req));

  if (!userId && needsAuth) {
    console.log(`❌ Unauthenticated access attempt to: ${pathname}`);

    // Return JSON error for API routes
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Redirect to sign-in for page routes
    return redirectToSignIn();
  }

  // STEP 3: Role-based authorization
  const userRole = sessionClaims?.role as string | undefined;
  console.log(`👤 User: ${userId?.slice(0, 8)}... | Role: ${userRole || 'none'} | Path: ${pathname}`);

  // Admin has full access to everything
  if (userRole === "admin") {
    console.log("✅ Admin Access Granted - Full Access");
    return NextResponse.next();
  }

  // STEP 4: Check role-specific access
  if (!userRole) {
    console.log(`❌ No role assigned - ${pathname}`);
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Forbidden - No role assigned" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Check API route access
  if (isApiRoute) {
    const apiMatcher = protectedApiRouteMatchers[userRole];
    if (apiMatcher && apiMatcher(req)) {
      console.log(`✅ ${userRole} access granted to API: ${pathname}`);
      return NextResponse.next();
    }

    console.log(`❌ Unauthorized: API route not allowed for ${userRole} - ${pathname}`);
    return NextResponse.json(
      { error: `Forbidden - ${userRole} role cannot access this endpoint` },
      { status: 403 }
    );
  }

  // Check page route access
  const pageMatcher = protectedRouteMatchers[userRole];
  if (pageMatcher && pageMatcher(req)) {
    console.log(`✅ ${userRole} access granted to page: ${pathname}`);
    return NextResponse.next();
  }

  // Default-deny: Reject any route not explicitly allowed
  console.log(`❌ Unauthorized - ${pathname} (Role: ${userRole})`);
  return NextResponse.redirect(new URL("/unauthorized", req.url));
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
  ],
};
