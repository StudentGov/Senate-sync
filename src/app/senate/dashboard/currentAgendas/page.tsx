'use client';
import { useState, useEffect } from "react";
import styles from './currentAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import AgendaData from '../../../agendas.json'
import AddAgenda from '../../../components/addAgenda/addAgenda'
import { useUser } from "@clerk/nextjs";
import DropDownOptions from '../../../components/dropDown/dropDown'

interface Agenda {
    id: string;
    agenda: string;
    visible: boolean;
    closed: boolean;
    options: string[];
    date: string;
  }
export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState<string>("Date");

    // useEffect(() => {
    //     if (isSignedIn && user?.publicMetadata?.role === "senate_member") {
    //         setIsMember(true);
    //         console.log(user.publicMetadata.role)
    //       }
    //     else if (isSignedIn && user?.publicMetadata?.role === "senate_speaker") {
    //         setIsSpeaker(true);
    //       }
    //   }, [user]);
    const sortedAgendaData: Agenda[] = [...AgendaData].sort((a, b) => {
        if (selectedOption === "Title") {
            return a.agenda.localeCompare(b.agenda); // Sorting by Title alphabetically
        } else if (selectedOption === "Date") {
            const dateA = new Date(a.date); // Convert 'date' string to Date object
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime(); // Sorting by Date (using getTime for comparison)
        }
        return 0; // No sorting if 'N/A'
    });

    return (
        <div className={styles.currentAgendas}>
            <div className={styles.top}>
                <h1>Current Agendas</h1>
                {isSpeaker && <AddAgenda />}
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                    <div className={styles.labels}>
                        <label>Title</label>
                        <div className={styles.rightLabels}>
                            <label className={styles.date}>Date</label>
                            {isMember && <label>Voted</label>}
                            {isSpeaker && <label>Visible</label>}
                        </div>
                        <DropDownOptions options={["Title", "Date"]} setSelectedOption={setSelectedOption} text={'Sort'}/>
                    </div>
                {sortedAgendaData.map((item, index) => (
                    !item.closed && 
                    (
                    <AgendaSection key={index} agenda={item} page={'current'} isMember={isMember} isSpeaker={isSpeaker}/>
                    )
                ))}
                </div>
            </div>
        </div>

    )
}