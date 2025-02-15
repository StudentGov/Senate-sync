"use client";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import styles from './sideBar.module.css'
import { useRouter } from "next/navigation";
import Logo from '../../assets/menu.png'
import Image from 'next/image'

interface SideBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SideBar({collapsed, setCollapsed}: SideBarProps) {
  const router = useRouter();
  return (
    <div className={styles.sideBar}> {/* Conditional class for visibility */}
      <Image src={Logo} alt="logo" className={styles.logo} onClick={() => setCollapsed(!collapsed)}/>
        <div className={`${styles.x} ${collapsed ? 'hidden' : 'block'}`}>
          <Sidebar>
            <Menu>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/senate/currentAgendas')}> Current Agendas </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/senate/PastAgendas')}> Past Agendas </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/senate/Profile')}> Profile </MenuItem>
                <MenuItem className={styles.sideBarItem} onClick={() => router.push('/senate/Settings')}> Settings </MenuItem>
            </Menu>
          </Sidebar>
        </div>

    </div>
  );
}
