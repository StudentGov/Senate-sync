'use client';
import styles from './pastAgendas.module.css'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext'
import SideBar from '../../components/sideBar/SideBar'

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.pastAgendas}>
            <h1>Past Agendas</h1>
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>

    )
}