import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Custom hook to assign a default role ("student") after login.
 * Redirects to /unauthorized only if user has no role.
 */
export function useAssignRole() {
  const { user } = useUser();
  const router = useRouter();
  const [roleAssigned, setRoleAssigned] = useState(false);

  useEffect(() => {
    // Prevent unnecessary re-execution if user is not logged in or role is already assigned
    if (!user || roleAssigned) return;

    const assignDefaultRole = async () => {
      try {
        // Call the backend API to assign or check role
        const response = await fetch("/api/assign-default-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
          }),
        });

        // Parse the response from the API
        const data = await response.json();
        console.log("User role:", data.role);

        // If no role is assigned, redirect to unauthorized
        if (!data.role) {
          router.replace("/unauthorized");
          return;
        }

        setRoleAssigned(true);
      } catch (error) {
        console.error("Error assigning role:", error);
      }
    };

    assignDefaultRole();
  }, [user, roleAssigned, router]);

  return null;
}
