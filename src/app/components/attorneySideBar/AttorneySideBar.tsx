"use client";
import { useState, useEffect } from 'react'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import styles from './attorneySideBar.module.css'
import { useRouter } from "next/navigation";
import Logo from '../../assets/menu.png'
import Image from 'next/image'
import { useAuth } from "@clerk/nextjs";
import { useClerk } from '@clerk/clerk-react';

interface SideBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SideBar({collapsed, setCollapsed}: SideBarProps) {
  const router = useRouter();
  const { sessionClaims, isSignedIn } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const { openUserProfile, signOut } = useClerk();

  useEffect(() => {
    if (isSignedIn && sessionClaims?.role === "super_admin") {
        setIsSuperAdmin(true);
    }

    }, [isSignedIn, sessionClaims]);

    
    const handleProfileClick = () => {
      openUserProfile();  // This will trigger the Clerk profile modal
    };
  return (
    <div className={styles.sideBar}> {/* Conditional class for visibility */}
      <Image src={Logo} alt="logo" className={styles.logo} onClick={() => setCollapsed(!collapsed)}/>
        <div className={`${styles.x} ${collapsed ? 'hidden' : 'block'}`}>
          <Sidebar onClick={() => setCollapsed(!collapsed)}>
            <Menu>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/attorney/dashboard/upcomingAppointments')}> Upcoming Appointments </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/attorney/dashboard/availability')}> Availability </MenuItem>  
                <MenuItem className={styles.sideBarItem} onClick={() => handleProfileClick()}> Profile </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => signOut()}> Sign Out </MenuItem>
                {isSuperAdmin && (<MenuItem className={styles.sideBarItem} onClick={() => router.push('/admin/dashboard')}> Admin Dashboard </MenuItem>)}
            </Menu>
          </Sidebar>
        </div>

    </div>
  );
}
