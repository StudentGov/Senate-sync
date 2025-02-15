"use client";

import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
              <AssignRoleOnLogin /> {/* Automatically assigns role after login */}
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

// **Assign Role to User on Login**
function AssignRoleOnLogin() {
  const { user } = useUser();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!user || roleChecked) return; // Prevent multiple executions

    const checkAndAssignRole = async () => {
      try {
        const response = await fetch(`/api/get-user-metadata?userId=${user.id}`);
        const data = await response.json();

        if (data.role) {
          console.log("User already has role:", data.role);
          setRoleChecked(true); // Mark as checked
          return;
        }

        console.log("Assigning 'student' role to user:", user.id);
        await fetch("/api/assign-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, role: "student" }),
        });

        console.log("Role assigned successfully.");
        setRoleChecked(true); // Prevent further execution
      } catch (error) {
        console.error("Error checking/assigning role:", error);
      }
    };

    checkAndAssignRole();
  }, [user, roleChecked]);

  return null;
}
