"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './attorney.module.css';

export default function AttorneyDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push("/attorney/dashboard/upcomingAppointments");
  }, [router]);

  return (
    <div className={styles.attorneyPage}>
      {/* Sidebar removed - navigation available through navbar */}
    </div>
  );
}
