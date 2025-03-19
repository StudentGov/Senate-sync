'use client';
import { useState, useEffect } from "react";
import styles from './pastAgendas.module.css'
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext'
import SideBar from '../../../components/sideBar/SideBar'
import AgendaSection from '../../../components/agendaSection/agendaSection'
import { useUser } from "@clerk/nextjs";
import DropDownOptions from '../../../components/dropDown/dropDown'

interface Agenda {
    id: number;
    title: string;
    agenda: string;
    visible: boolean;
    is_visible: boolean;
    closed: boolean;
    options: { options: string[] }; //  Wrapped options inside an object
    date: string;
    created_at: string;
    is_open: boolean;
    user: number;
}

export default function PastAgendas(){
    const { collapsed, setCollapsed } = useCollapsedContext();
    const { user, isSignedIn } = useUser();
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string>("Date");
    const [agendas, setAgendas] = useState<Agenda[]>([]);

    useEffect(() => {
        if (isSignedIn && (user?.publicMetadata?.role === "senate_member" || user?.publicMetadata?.role === "super_admin")) {
            setIsMember(true);
            console.log(user.publicMetadata.role);
        }
        if (isSignedIn && (user?.publicMetadata?.role === "senate_speaker" || user?.publicMetadata?.role === "super_admin")) {
            setIsSpeaker(true);
        }
    }, [isSignedIn, user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
              const response = await fetch("/api/get-data");
              const data = await response.json();
              console.log(data, typeof data.data);
              setAgendas(data.data.map((agenda: Partial<Agenda>) => ({ ...agenda, options: { options: agenda.options || [] } }))); //  Ensure options are correctly wrapped
            } catch (error) {
              console.error("Error fetching users:", error);
            }
        };
        fetchData();
    }, []);

    const sortedAgendaData: Agenda[] = [...agendas].sort((a, b) => {
        if (selectedOption === "Title") {
            return a.title.localeCompare(b.title);
        }
        return 0;
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
                        <DropDownOptions options={["Title", "Date"]} setSelectedOption={setSelectedOption} text={'Sort'}/>
                    </div>
                    {sortedAgendaData.map((item, index) => (
                        !item.is_open &&
                        <AgendaSection 
                        key={index}
                        agenda={item}
                        page={'past'}
                        isMember={isMember}
                        isSpeaker={isSpeaker}
                        user={{ id: Number(user?.id || 0) }} vote={function (): Promise<unknown> {
                          throw new Error("Function not implemented.");
                        } }                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
