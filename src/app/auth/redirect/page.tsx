"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

/**
 * Component to handle user redirection based on role after login.
 * This ensures users are redirected to the appropriate dashboard
 * depending on their assigned role in Clerk's sessionClaims.
 */
export default function RedirectPage() {
  const router = useRouter();
  const { sessionClaims, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * useEffect to handle role-based redirection.
   * Executes once user authentication status is determined.
   */
  useEffect(() => {
    if (isSignedIn && sessionClaims) {
      // Fetch the user's role from Clerk's sessionClaims
      const userRole = sessionClaims?.role;

      // Redirect users to their respective dashboards based on role
      switch (userRole) {
        case "admin":
        case "dev":
          router.replace("/admin/dashboard");
          break;
        case "attorney":
          router.replace("/attorney/dashboard");
          break;
        case "senator":
          router.replace("/senate/dashboard");
          break;
        case "coordinator":
          router.replace("/admin/dashboard");
          break;
        default:
          router.replace("/unauthorized"); // Redirect if no valid role is found
      }
    }
  }, [isSignedIn, sessionClaims, router]);

  /**
   * useEffect to handle a loading delay to ensure
   * the redirect logic completes before rendering the page.
   */
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  // Display loading message while redirecting
  if (isLoading) {
    return <p>Redirecting...</p>;
  }

  // Return null if no redirection is needed
  return null;
}
