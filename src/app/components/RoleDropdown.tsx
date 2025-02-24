"use client";

import { useState } from "react";

const roles = ["student", "attorney", "senate_member", "senate_speaker"];

interface RoleDropdownProps {
  userId: string;
  currentRole: string;
}

/**
 * RoleDropdown displays a dropdown menu to change the user's role.
 * Admins can use this component to update user roles dynamically.
 */
export default function RoleDropdown({ userId, currentRole }: RoleDropdownProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  /**
   * Handles the role change event and updates the user role.
   * Sends a POST request to the backend API to update the role in Clerk.
   */
  const handleRoleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value; // Use "role" instead of "newRole"
    console.log("Selected Role:", role); // Debug log to check selected role

    setSelectedRole(role);

    try {
      // Call the backend API to update the user's role
      const response = await fetch("/api/update-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }), // Send "role" instead of "newRole"
      });

      // Parse the response and handle the result
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        alert("Role updated successfully!");
      } else {
        console.error("Failed to update role:", data.error);
        alert(`Failed to update role: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Please try again.");
    }
  };

  return (
    <select value={selectedRole} onChange={handleRoleChange}>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
