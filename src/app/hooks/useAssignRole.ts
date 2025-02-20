import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Custom hook to assign a default role ("student") after login.
 * This ensures new users receive a default role upon their first login.
 */
export function useAssignRole() {
  const { user } = useUser();
  const [roleAssigned, setRoleAssigned] = useState(false);

  useEffect(() => {
    // Prevent unnecessary re-execution if user is not logged in or role is already assigned
    if (!user || roleAssigned) return; 

    const assignDefaultRole = async () => {
      try {
        // Call the backend API to assign the default role
        const response = await fetch("/api/assign-default-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, email: user.primaryEmailAddress?.emailAddress }),
        });

        // Parse the response from the API
        const data = await response.json();
        console.log(data.message);

        // Mark role as assigned to prevent further execution
        setRoleAssigned(true);
      } catch (error) {
        console.error("Error assigning role:", error);
      }
    };

    assignDefaultRole();
  }, [user, roleAssigned]);

  return null;
}
