'use client';
import styles from './CurrentAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/AgendaSection'
import AgendaData from '../../../agendas.json'
import AddAgenda from '../../../components/addAgenda/AddAgenda'

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.currentAgendas}>
            <div className={styles.top}>
                <h1>Current Agendas</h1>
                <AddAgenda />
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                    <div className={styles.labels}>
                        <label>Title</label>
                        <div className={styles.rightLabels}>
                            <label>Voted</label>
                            <label>Visible</label>
                        </div>
                    </div>
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