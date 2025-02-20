"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import UserTable from "../../components/UserTable";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Component
 * Displays a list of all users for the super_admin role.
 * Redirects unauthorized users to the /unauthorized page.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [users, setUsers] = useState([]);

  /**
   * useEffect to check user authorization and fetch all users.
   * Ensures only super_admins can access the Admin Dashboard.
   */
  useEffect(() => {
    // Check if the user is signed in and has the super_admin role
    if (isSignedIn && user?.publicMetadata?.role !== "super_admin") {
      router.push("/unauthorized"); // Redirect unauthorized users
    }

    /**
     * Function to fetch all users from the backend API.
     * This allows the admin to view a list of all registered users.
     */
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-all-users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch users if the admin is signed in
    if (isSignedIn && user?.publicMetadata?.role === "super_admin") {
      fetchUsers();
    }
  }, [isSignedIn, user, router]);

  return (
    <div className={styles.adminPage}>
      <h1>Admin Dashboard</h1>
      <UserTable users={users} />
    </div>
  );
}
