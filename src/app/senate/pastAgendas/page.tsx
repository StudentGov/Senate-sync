'use client';
import styles from './pastAgendas.module.css'
import { useCollapsedContext } from '../../components/sideBar/sideBarContext'
import SideBar from '../../components/sideBar/SideBar'
import AgendaSection from '../../components/agendaSection/agendaSection'
import AgendaData from '../../agendas.json'

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    return (
        <div className={styles.pastAgendas}>
            <div className={styles.top}>
                <h1>Past Agendas</h1>
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                {AgendaData.map((item, index) => (
                    (item.closed &&
                    <AgendaSection key={index} agenda={item} page={'past'}/>)
                ))}
                </div>
            </div>
        </div>

    )
}