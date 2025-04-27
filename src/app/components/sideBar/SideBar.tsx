"use client";
import { useState, useEffect } from 'react'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import styles from './sideBar.module.css'
import { useRouter } from "next/navigation";
import { useAgendaStore } from "@/app/lib/store"; // <-- import your store
import Logo from '../../assets/menu.png'
import Image from 'next/image'
import { useUser } from "@clerk/nextjs";
import { useClerk } from '@clerk/clerk-react';

interface SideBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SideBar({collapsed, setCollapsed}: SideBarProps) {
  const router = useRouter();
  const { setAgendaType } = useAgendaStore(); // <-- get the setter
  const { user, isSignedIn } = useUser();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const { openUserProfile, signOut } = useClerk();

  useEffect(() => {
    if (isSignedIn && user?.publicMetadata?.role === "super_admin") {
        setIsSuperAdmin(true);
    }

    }, [isSignedIn, user]);

    
    const handleProfileClick = () => {
      openUserProfile();  // This will trigger the Clerk profile modal
    };
  return (
    <div className={styles.sideBar}> {/* Conditional class for visibility */}
      <Image src={Logo} alt="logo" className={styles.logo} onClick={() => setCollapsed(!collapsed)}/>
        <div className={`${styles.x} ${collapsed ? 'hidden' : 'block'}`}>
          <Sidebar onClick={() => setCollapsed(!collapsed)}>
            <Menu>
                <MenuItem className={styles.sideBarItem} onClick={() => setAgendaType("current")}> Current Agendas </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => setAgendaType("past")}> Past Agendas </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => handleProfileClick()}> Profile </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => signOut()}> Sign Out </MenuItem>
                {isSuperAdmin && (<MenuItem className={styles.sideBarItem} onClick={() => router.push('/admin/dashboard')}> Admin Dashboard </MenuItem>)}
            </Menu>
          </Sidebar>
        </div>

    </div>
  );
}
