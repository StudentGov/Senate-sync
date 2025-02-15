"use client";
import { useState } from 'react'
import styles from './senate.module.css'
import SideBar from '../components/sideBar/SideBar'

export default function SenatePage(){
    const [collapsed, setCollapsed] = useState<boolean>(false);
    return (
        <div className={styles.senatePage}>
            <h1>This is the Senate Page</h1>
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>
        
    )
}