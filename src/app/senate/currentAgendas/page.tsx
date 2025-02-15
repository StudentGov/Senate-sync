'use client';
import styles from './currentAgendas.module.css'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext'
import SideBar from '../../components/sideBar/SideBar'

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.currentAgendas}>
            <h1>Current Agendas</h1>
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>

    )
}