"use client";
import styles from './senate.module.css'
import SideBar from '../../components/sideBar/SideBar'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext';

export default function SenatePage(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.senatePage}>
            <h1>This is the Senate Page</h1>
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>
        
    )
}