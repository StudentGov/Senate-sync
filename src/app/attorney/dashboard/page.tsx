"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './attorney.module.css';
import SideBar from '../../components/attorneySideBar/AttorneySideBar';
import { useCollapsedContext, CollapsedProvider } from '../../components/attorneySideBar/attorneySideBarContext';

function AttorneyDashboardContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();

  useEffect(() => {
    router.push("/attorney/dashboard/upcomingAppointments");
  }, [router]);

  return (
    <div className={styles.attorneyPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
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
