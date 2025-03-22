'use client';
import { useState, useEffect } from "react";
import styles from './pastAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import AgendaData from '../../../agendas.json'
import { useUser } from "@clerk/nextjs";
import DropDownOptions from '../../../components/dropDown/dropDown'

interface Option {
    id: number;
    optionText: string;
  }
interface Agenda {
    id: number;
    speaker_id: string;
    title: string;
    description: string;
    is_visible: boolean;
    is_open: boolean;
    created_at: string;
    options: Option[]
  }
export default function PastAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string>("Date");
    const [agendaData, setAgendaData] = useState<Agenda[]>([]);

    useEffect(() => {
        if (isSignedIn && (user?.publicMetadata?.role === "senate_member" || user?.publicMetadata?.role === "super_admin")) {
            setIsMember(true);
            console.log(user.publicMetadata.role);
        }
        if (isSignedIn && (user?.publicMetadata?.role === "senate_speaker" || user?.publicMetadata?.role === "super_admin")) {
            setIsSpeaker(true);
        }
        fetchAgendas();

    }, [isSignedIn, user]);
    async function fetchAgendas() {
        try {
          // Create the body of the request with the 'is_open' parameter
          const response = await fetch('/api/get-agendas', {  // Replace with your actual API endpoint
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',  // Ensure content is JSON
            },
            body: JSON.stringify({ is_open: false }), // Send 'is_open' parameter as JSON
          });
      
          // Check if the response is successful
          if (!response.ok) {
            throw new Error('Failed to fetch agendas');
          }
      
          // Parse the response JSON
          const data = await response.json();
          
          // Handle the response data
          console.log('Agendas:', data.agendas);  // The 'agendas' data returned from the API
          setAgendaData(data.agendas)
      
        } catch (error) {
          console.error('Error fetching agendas:', error);
        }
      }

      const sortedAgendaData: Agenda[] = [...agendaData].sort((a, b) => {
        if (selectedOption === "Title") {
          return a.title.localeCompare(b.title); // Sorting by Title alphabetically
        } else if (selectedOption === "Date") {
          const dateA = new Date(a.created_at); // Convert 'created_at' string to Date object
          const dateB = new Date(b.created_at);
      
          // Sorting by Date (using getTime for comparison)
          return dateB.getTime() - dateA.getTime(); // Sorting from newest to oldest
        }
        return 0; // No sorting if 'N/A'
      });
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
                            <label>Date</label>
                            {isMember && <label>Voted</label>}
                            {isSpeaker && <label>Visible</label>}
                        </div>
                        {/* <DropDownOptions options={["Title", "Date"]} setSelectedOption={setSelectedOption} text={'Sort'}/> */}
                    </div>
                {sortedAgendaData.map((item, index) => (
                    (!item.is_open &&
                    <AgendaSection key={index} agenda={item} page={'past'} isMember={isMember} isSpeaker={isSpeaker} user={user}/>)
                ))}
                </div>
            </div>
        </div>

    )
}