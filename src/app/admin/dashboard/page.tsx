"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import UserTable from "../../components/UserTable";
import CreateUserForm from "../../components/CreateUserForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Component
 * Displays a list of all users and allows admins to create new users.
 * Only users with the 'admin' role can access this page.
 * Redirects unauthorized users to the /unauthorized page.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState<"users" | "create">("users");

  /**
   * Function to fetch all users from the backend API.
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

  /**
   * useEffect to check user authorization and fetch all users.
   * Only admins can access the dashboard.
   */
  useEffect(() => {
    // Don't do anything until user data is loaded
    if (!isSignedIn) return;
    if (!user) return;
    
    const userRole = user?.publicMetadata?.role as string;
    console.log("Admin Dashboard - User Role:", userRole); // Debug log
    
    // Check if the user has admin access
    if (userRole !== "admin") {
      console.log("Access denied - redirecting to unauthorized"); // Debug log
      router.push("/unauthorized");
      return;
    }

    // Fetch users if the admin is signed in
    console.log("Admin access granted - fetching users"); // Debug log
    fetchUsers();
  }, [isSignedIn, user, router]);

  const handleUserCreated = () => {
    // Refresh the user list when a new user is created
    fetchUsers();
    // Switch to users tab to show the newly created user
    setActiveTab("users");
  };

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show message if not signed in
  if (!isSignedIn) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please sign in to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <h1>Admin Dashboard</h1>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Manage Users ({users.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "create" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create New User
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "users" && <UserTable users={users} />}
        {activeTab === "create" && <CreateUserForm onUserCreated={handleUserCreated} />}
      </div>
    </div>
  );
}
