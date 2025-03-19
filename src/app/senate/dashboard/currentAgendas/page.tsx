'use client';
import { useState, useEffect } from "react";
import styles from './currentAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import AddAgenda from '../../../components/addAgenda/addAgenda'
import { useUser } from "@clerk/nextjs";
import DropDownOptions from '../../../components/dropDown/dropDown'

interface Agenda {
    id: number;
    agenda: string;
    visible: boolean;
    closed: boolean;
    options: string[];
    date: string;
    title: string; // Add this property to fix the error
    created_at: string; // Add this property to fix the error
    is_open: boolean; // Add this property to fix the error
    is_visible: boolean; // Add this property to fix the error
    user: number; // Add this property to fix the error
  }
export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string>("Date");
    const [agendas, setAgendas] = useState<Agenda[]>([]);

    useEffect(() => {
        if (isSignedIn && (user?.publicMetadata?.role === "senate_member" || user?.publicMetadata?.role === "super_admin")) {
            setIsMember(true);
            console.log(user.publicMetadata.role)
          }
        if (isSignedIn && (user?.publicMetadata?.role === "senate_speaker" || user?.publicMetadata?.role === "super_admin")) {
            setIsSpeaker(true);
          }
      }, [user, isSignedIn]);
    const sortedAgendaData: Agenda[] = [...agendas].sort((a, b) => {
        if (selectedOption === "Title") {
            return a.title.localeCompare(b.title); // Sorting by Title alphabetically
        } else if (selectedOption === "Date") {
            const dateA = new Date(a.created_at); // Convert 'date' string to Date object
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime(); // Sorting by Date (using getTime for comparison)
        }
        return 0; // No sorting if 'N/A'
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
              const response = await fetch("/api/get-data");
              const data = await response.json();
              console.log(data, typeof data.data)
              setAgendas(data.data)
            } catch (error) {
              console.error("Error fetching users:", error);
            }
          };
          fetchData();
    }, [])

    async function handleVote(agenda: Agenda, user: unknown) {
        const response = await fetch('/api/handle-votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agendaId: agenda.id, 
            user: user,
          }),
        });
    
        const result = await response.json();
        // console.log(result)
        if (!result.success) {
          console.error('Error:', result.message);
        } else {
        //   console.log('OK:', result.message, result.data);
        }
        // console.log(result.data)
        return result
      }

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
                {sortedAgendaData.length > 0 ? sortedAgendaData.map((item, index) => (
                    item.is_open && 
                    (      
                    <AgendaSection key={index} agenda={item} page={'current'} isMember={isMember} isSpeaker={isSpeaker} vote={() => handleVote(item, user)} user={user}/>
                    )
                )):<></>}
                </div>
            </div>
        </div>

    )
}