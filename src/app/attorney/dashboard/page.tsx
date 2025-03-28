"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from './attorney.module.css';
import SideBar from '../../components/attorneySideBar/AttorneySideBar';
import { useCollapsedContext, CollapsedProvider } from '../../components/attorneySideBar/attorneySideBarContext';



function AttorneyDashboardContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    router.push("/attorney/dashboard/upcomingAppointments");
    setRedirecting(false);
  }, [router]);

  // Return only sidebar during redirect (no message)
  return (
    <div className={styles.attorneyPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Return nothing else */}
    </div>
  );
}

export default function AttorneyPage() {
  return (
    <CollapsedProvider>
      <AttorneyDashboardContent />
    </CollapsedProvider>
  );
}
