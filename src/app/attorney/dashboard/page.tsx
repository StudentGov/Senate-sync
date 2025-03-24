"use client";
import styles from './attorney.module.css';
import SideBar from '../../components/attorneySideBar/AttorneySideBar';
import { useCollapsedContext, CollapsedProvider } from '../../components/attorneySideBar/attorneySideBarContext';

function AttorneyDashboardContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();

  return (
    <div className={styles.attorneyPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.contentArea}>
        <h1>Welcome, Attorney! You have access to this page.</h1>
      </div>
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
