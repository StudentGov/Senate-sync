"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function RedirectPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const userRole = user.publicMetadata?.role; // Assuming Clerk stores role in publicMetadata
      if (userRole === "attorney") {
        router.push("/attorney/dashboard");
      } else if (userRole === "senate_member") {
        router.push("/senate/dashboard");
      } else {
        router.push("/unauthorized"); // If no valid role
      }
    }
  }, [isSignedIn, user, router]);

  return <p>Redirecting...</p>;
}
