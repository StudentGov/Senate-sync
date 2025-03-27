'use client';
import { useState, useEffect } from "react";
import styles from './currentAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import AddAgenda from '../../../components/addAgenda/addAgenda'
import { useUser } from "@clerk/nextjs";
import DropDownOptions from "@/app/components/dropDown/dropDown";
import pusherClient from '../../../lib/pusher'

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
interface User {
  id: string;
  firstName: string,
  lastName: string
}
  

export default function CurrentAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<Option>({id:1, optionText:"Date"});
    const [agendaData, setAgendaData] = useState<Agenda[]>([]);

    useEffect(() => {
      const channel = pusherClient.subscribe('agenda-channel')
    
      const handleNewAgenda = (data: { message: string }) => {
        console.log(data.message)
        fetchAgendas();
      };
      channel.bind('new-agenda', handleNewAgenda)
      return () => {
        channel.unbind('new-agenda', handleNewAgenda)
      }
    }, [])


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
            body: JSON.stringify({ is_open: true }), // Send 'is_open' parameter as JSON
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
        if (selectedOption.optionText === "Title") {
          return a.title.localeCompare(b.title); // Sorting by Title alphabetically
        } else if (selectedOption.optionText === "Date") {
          const dateA = new Date(a.created_at); // Convert 'created_at' string to Date object
          const dateB = new Date(b.created_at);
      
          // Sorting by Date (using getTime for comparison)
          return dateB.getTime() - dateA.getTime(); // Sorting from newest to oldest
        }
        return 0; // No sorting if 'N/A'
      });
      const userData: User = {
        id: user?.id || '', // Default to empty string if undefined
        firstName: user?.firstName || '', // Default to empty string if undefined
        lastName: user?.lastName || '', // Default to empty string if undefined
      };
      
    return (
        <div className={styles.currentAgendas}>
            <div className={styles.top}>
                <h1>Current Agendas</h1>
                {isSpeaker && user && <AddAgenda user={user} />}
            </div>

            <SideBar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div className={styles.sections}>
                <div className={styles.content}>
                    <div className={styles.labels}>
                        <label>Title</label>
                        <label className={styles.date}>Date</label>
                        <div className={styles.rightLabels}>
                            {isMember && <label>Voted</label>}
                            {isSpeaker && <label>Visible</label>}
                            <DropDownOptions options={[{id:0, optionText:"Title"}, {id:1, optionText:"Date"}]} setSelectedOption={setSelectedOption} text={'Sort'}/>
                        </div>
                    </div>
                {sortedAgendaData.map((item, index) => (
                    item.is_open && 
                    (
                    <AgendaSection key={index} agenda={item} page={'current'} isMember={isMember} isSpeaker={isSpeaker} user={userData}/>
                    )
                ))}
                </div>
            </div>
        </div>

    )
}