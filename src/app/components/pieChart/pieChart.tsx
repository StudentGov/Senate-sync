"use client";
import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import styles from './pieChart.module.css';
import Individual from '../individual/individual';
import pusherClient from '@/app/lib/pusher';


interface AgendaProps {
    agenda: {
      id:number,
      title: string;
      is_visible: boolean;
      is_open: boolean;
      created_at: string;
    };
    isSpeaker: boolean
}

interface DataItem {
    id: number;
    value: number;
    label: string;
}

export default function PieChartPopUp({agenda, isSpeaker}: AgendaProps) {
    const [modal, setModal] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0);
    const [voteData, setVoteData] = useState<DataItem[]>([]);
    useEffect(() => {
        const channel = pusherClient.subscribe('agenda-channel')
      
        const handleVoteUpdated = (data: { message: string }) => {
          console.log(data.message)
          fetchVotes();
        };
      
        channel.bind('vote-updated', handleVoteUpdated)
      
        return () => {
          channel.unbind('vote-updated', handleVoteUpdated)
        }
      }, [agenda.id])
    const toggleModal = () => {
        setModal(!modal);
    };
    // Calculate the sum of values
    useEffect(() => {
        // Calculate the sum of values
        const totalValue = voteData.reduce((sum, item) => sum + item.value, 0);
        // Update state
        setSum(totalValue);


    }, [voteData]);

    // UseEffect to manage modal state safely on the client side
    useEffect(() => {
        if (typeof window !== "undefined") { // Check if running on the client
            if (modal) {
                document.body.classList.add('active-modal');
            } else {
                document.body.classList.remove('active-modal');
            }
        }
    }, [modal]); // Re-run when modal state changes

    async function fetchVotes() {
        try {
          const response = await fetch('/api/get-vote-count', { // Replace '/api/your-endpoint' with the actual API URL
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // Set content type to JSON
            },
            body: JSON.stringify({ agenda_id:agenda.id }), // Send the agenda_id in the request body
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch options');
          }
      
          const data = await response.json();
          console.log(`Fetched votes for ${agenda.title}:`, data);
          setVoteData(data.data)
          // You can return or use the data here
          return data;
      
        } catch (error) {
          console.error(`Error fetching votes for ${agenda.title}:`, error);
        }
      }
      

    const size = { width: 400, height: 500 };
    const chartData = { data: voteData || [] }; // Fixed TypeScript error

    return (
        <>
            <button onClick={() => {toggleModal(); fetchVotes()}} className={styles.btnModal}>View Voting</button>

            {modal && (
                <div className={styles.modal}>
                    <div onClick={toggleModal} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        <h2 className={styles.title}>{agenda.title}</h2>
                        <button className={styles.closeModal} onClick={toggleModal}>CLOSE</button>
                        <PieChart
                            series={[
                                {
                    arcLabel: (item) => `${(item.value/sum*100).toFixed(2)}%`,
                                    arcLabelMinAngle: 35,
                                    arcLabelRadius: '60%',
                                    ...chartData,
                                },
                            ]}
                            sx={{
                                [`& .${pieArcLabelClasses.root}`]: {
                                    fontWeight: 'bold',
                                },
                            }}
                            {...size}
                        />
                        <div className={styles.individual}>
                            {agenda.is_visible || isSpeaker ? <Individual agenda_id={agenda.id} agenda_title={agenda.title}/>:<></>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
