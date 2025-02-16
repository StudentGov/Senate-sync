'use client';
import styles from './currentAgendas.module.css'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext'
import SideBar from '../../components/sideBar/SideBar'
import AgendaSection from '../../components/agendaSection/agendaSection'
import AgendaData from '../../agendas.json'

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.currentAgendas}>
            <div className={styles.top}>
                <h1>Current Agendas</h1>
                <button>Add Agenda</button>
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                {AgendaData.map((item, index) => (
                    !item.closed && 
                    (
                    <AgendaSection key={index} agenda={item} page={'current'}/>
                    )
                ))}
                </div>
            </div>
        </div>

    )
}