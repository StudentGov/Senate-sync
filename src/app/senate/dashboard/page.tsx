
"use client";
import styles from './senate.module.css'
import SideBar from '../../components/sideBar/SideBar'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext';

export default function SenatePage(){
    console.log("In senate page")
    const { collapsed, setCollapsed } = useCollapsedContext();

    return (
        <div className={styles.senatePage}>
            <h1>Welcome, Senate Member! You have access to this page.</h1>
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>
        
    )
}

