"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./admin.module.css";
import UserTable from "../../components/UserTable";
import CreateUserForm from "../../components/CreateUserForm";
import AdminHourLogClient from "../components/AdminHourLogClient";
import TeamMemberEditor from "../components/TeamMemberEditor";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Component
 * Displays a list of all users and allows admins to create new users.
 * Only users with the 'admin' role can access this page.
 * Redirects unauthorized users to the /unauthorized page.
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { sessionClaims, isSignedIn, isLoaded } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState<"users" | "create" | "hours" | "team">("users");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [userTableKey, setUserTableKey] = useState(0);
  
  // Hour log data - cached in parent so it persists across tab switches
  const [hourLogData, setHourLogData] = useState<{
    periods: Record<string, Record<string, { total: number; name?: string; entries: any[] }>>;
    sortedPeriodKeys: string[];
    targetHours: number;
  } | null>(null);
  const [hourLogLoading, setHourLogLoading] = useState(false);
  const [hourLogError, setHourLogError] = useState<string | null>(null);
  const hasFetchedHourLogs = useRef(false);

  /**
   * Function to fetch all users from the backend API.
   */
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/get-all-users", {
        cache: 'default', // Use browser cache
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  /**
   * Function to fetch hour log data from the backend API.
   */
  const fetchHourLogData = async () => {
    setHourLogLoading(true);
    setHourLogError(null);
    try {
      const response = await fetch("/api/admin/hour-log", {
        cache: 'default', // Use browser cache
      });
      if (!response.ok) {
        throw new Error("Failed to fetch hour logs");
      }
      const data = await response.json();
      setHourLogData({
        periods: data.periods || {},
        sortedPeriodKeys: data.sortedPeriodKeys || [],
        targetHours: data.TARGET_HOURS || 6,
      });
    } catch (error) {
      console.error("Error fetching hour logs:", error);
      setHourLogError(error instanceof Error ? error.message : "Failed to fetch hour logs");
    } finally {
      setHourLogLoading(false);
    }
  };

  /**
   * useEffect to check user authorization and fetch all users.
   * Only admins can access the dashboard.
   */
  useEffect(() => {
    // Don't do anything until user data is loaded
    if (!isSignedIn) return;
    if (!sessionClaims) return;
    
    const userRole = sessionClaims?.role as string;
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
  }, [isSignedIn, sessionClaims, router]);

  /**
   * Separate useEffect to fetch hour log data once when component mounts
   * Uses a ref to ensure we only fetch once
   */
  useEffect(() => {
    if (hasFetchedHourLogs.current) return;
    hasFetchedHourLogs.current = true;
    fetchHourLogData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * Warn user before leaving page with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasPendingChanges]);

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
    <div className={styles['admin-dashboard-page']}>
      <h1>Admin Dashboard</h1>
      
      <div className={styles['admin-tabs']}>
        <button
          className={`${styles['admin-tab']} ${activeTab === "users" ? styles['admin-active-tab'] : ""}`}
          onClick={() => {
            if (hasPendingChanges && activeTab !== "users") {
              const confirmed = confirm(
                "You have unsaved changes. Switching tabs will discard all changes. Continue?"
              );
              if (!confirmed) return;
              // Reset UserTable by changing key to force remount
              setUserTableKey((prev) => prev + 1);
              setHasPendingChanges(false);
            }
            setActiveTab("users");
          }}
        >
          Manage Users ({users.length})
        </button>
        <button
          className={`${styles['admin-tab']} ${activeTab === "create" ? styles['admin-active-tab'] : ""}`}
          onClick={() => {
            if (hasPendingChanges && activeTab !== "create") {
              const confirmed = confirm(
                "You have unsaved changes. Switching tabs will discard all changes. Continue?"
              );
              if (!confirmed) return;
              // Reset UserTable by changing key to force remount
              setUserTableKey((prev) => prev + 1);
              setHasPendingChanges(false);
            }
            setActiveTab("create");
          }}
        >
          Create New User
        </button>
        <button
          className={`${styles['admin-tab']} ${activeTab === "hours" ? styles['admin-active-tab'] : ""}`}
          onClick={() => {
            if (hasPendingChanges && activeTab !== "hours") {
              const confirmed = confirm(
                "You have unsaved changes. Switching tabs will discard all changes. Continue?"
              );
              if (!confirmed) return;
              // Reset UserTable by changing key to force remount
              setUserTableKey((prev) => prev + 1);
              setHasPendingChanges(false);
            }
            setActiveTab("hours");
          }}
        >
          Hour Log
        </button>
        <button
          className={`${styles['admin-tab']} ${activeTab === "team" ? styles['admin-active-tab'] : ""}`}
          onClick={() => setActiveTab("team")}
        >
          Edit Team
        </button>
      </div>

      <div className={styles['admin-tab-content']}>
        {activeTab === "users" && (
          <UserTable 
            key={userTableKey}
            users={users} 
            onPendingChangesChange={setHasPendingChanges}
          />
        )}
        {activeTab === "create" && <CreateUserForm onUserCreated={handleUserCreated} />}
        {activeTab === "hours" && (
          <AdminHourLogClient 
            hourLogData={hourLogData}
            loading={hourLogLoading}
            error={hourLogError}
            users={users}
          />
        )}
        {activeTab === "team" && <TeamMemberEditor />}
      </div>
    </div>
  );
}
