"use client";
import styles from "./home.module.css";
import { useRouter } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser(); // Get user info from Clerk

  // Function to handle role-based redirection
  const handleNavigation = (route: string) => {
    if (!user) {
      // Redirect to sign-in if not logged in
      router.push("/auth/sign-in");
    } else {
      // Redirect authenticated users to their dashboard (handled on back end)
      router.push(route);
    }
  };

  return (
    <div className={styles.homePage}>

      {/* Main Heading */}
      <h1>Home Page</h1>

      {/* Navigation Buttons */}
      <div>
        <button
          className={styles.navButton}
          onClick={() => router.push("/student/schedule")}
        >
          Schedule
        </button>
        <button
          className={styles.navButton}
          onClick={() => handleNavigation("/attorney/dashboard")}
        >
          Attorney
        </button>
        <button
          className={styles.navButton}
          // onClick={() => handleNavigation("/senate/dashboard")}
          onClick={() => handleNavigation("/senate/dashboard/currentAgendas")}
        >
          Senate
        </button>
      </div>

      {/* Profile Section at Bottom  */}
      <div className={styles.profileSection}>
        <SignedIn>
          <p>Welcome, {user?.firstName}!</p>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <button
            className={styles.loginBtn}
            onClick={() => router.push("/auth/sign-in")}
          >
            Sign In
          </button>
        </SignedOut>
      </div>

    </div>
  );
}
