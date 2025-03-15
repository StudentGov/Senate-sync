'use client';
import { useState, useEffect } from "react";
import styles from './pastAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import AgendaData from '../../../agendas.json'
import { useUser } from "@clerk/nextjs";
export default function PastAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(true);

    // useEffect(() => {
    //     if (isSignedIn && user?.publicMetadata?.role === "senate_member") {
    //         setIsMember(true);
    //         console.log(user.publicMetadata.role)
    //       }
    //     else if (isSignedIn && user?.publicMetadata?.role === "senate_speaker") {
    //         setIsSpeaker(true);
    //       }
    //   }, [user]);
    return (
        <div className={styles.pastAgendas}>
            <div className={styles.top}>
                <h1>Past Agendas</h1>
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                    <div className={styles.labels}>
                        <label>Title</label>
                        <div className={styles.rightLabels}>
                            {isMember && <label>Voted</label>}
                            {isSpeaker && <label>Visible</label>}
                        </div>
                    </div>
                {AgendaData.map((item, index) => (
                    (item.closed &&
                    <AgendaSection key={index} agenda={item} page={'past'} isMember={isMember} isSpeaker={isSpeaker}/>)
                ))}
                </div>
            </div>
        </div>

    )
}