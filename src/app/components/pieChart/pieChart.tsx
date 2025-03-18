import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Data from '../../voting.json';
import Individual from '../individual/individual';
import styles from './pieChart.module.css';

interface DataItem {
    id: number;
    value: number;
    label: string;
}

// Updated to allow string indexing
interface DataObject {
    [key: string]: {
        data: DataItem[];
    };
}

// Explicitly typing the imported JSON as DataObject
const VotingData: DataObject = Data;

export default function PieChartPopUp({agenda}: {agenda:any}) {
    const [modal, setModal] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0);
    const [agendaData, setAgendaData] = useState([])

    const toggleModal = () => {
        setModal(!modal);
    };
    const processVotes = (votes) => {
        const voteCounts = {};
      
        // Count occurrences of each option_text
        votes.forEach((vote) => {
          if (!voteCounts[vote.option_text]) {
            voteCounts[vote.option_text] = 0;
          }
          voteCounts[vote.option_text] += 1;
        });
      
        // Convert into desired format
        return Object.entries(voteCounts).map(([label, value], index) => ({
          id: index,
          value,
          label,
        }));
      };
    useEffect(() => {
        const getVotes = async (agendaId) => {
            try {
              const response = await fetch("/api/get-votes", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ agendaId: agendaId }),
              });
          
              const data = await response.json();
          
              if (response.ok) {
                console.log("Votes:", data.votes);
                const dummy = processVotes(data.votes)
                setAgendaData(dummy)
                const totalValue = dummy.reduce((sum, item) => sum + item.value, 0);
                setSum(totalValue);
                return data.votes;
              } else {
                console.error("Error fetching votes:", data.error);
                return [];
              }
            } catch (error) {
              console.error("Request failed:", error);
              return [];
            }
          };
          getVotes(agenda.id)
    }, [])
    // Calculate the sum of values
    // useEffect(() => {
    //     // Get the data for the specific id
    //     const agendaData = (VotingData[id]?.data || []) as DataItem[]; // Fixed TypeScript error
    
    //     // Calculate the sum of values
    //     const totalValue = agendaData.reduce((sum, item) => sum + item.value, 0);
    
    //     // Update state
    //     setSum(totalValue);
    // }, [id]);

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

    const size = { width: 400, height: 500 };
    // const chartData = { data: VotingData['1']?.data || [] }; // Fixed TypeScript error
    const chartData = { data: agendaData || [] }; // Fixed TypeScript error
    return (
        <>
            <button onClick={toggleModal} className={styles.btnModal}>View Voting</button>

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
                            <Individual id={'1'}/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
