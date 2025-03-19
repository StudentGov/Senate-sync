import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Individual from '../individual/individual';
import styles from './pieChart.module.css';

interface DataItem {
    id: number;
    value: number;
    label: string;
}

interface Agenda {
    id: number; //  Ensure it's always a number
    title: string;
}

export default function PieChartPopUp({ agenda }: { agenda: Agenda }) {
    const [modal, setModal] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0);
    const [agendaData, setAgendaData] = useState<DataItem[]>([]);

    const toggleModal = () => {
        setModal(!modal);
    };

    const processVotes = (votes: { option_text: string }[]) => {
        const voteCounts: Record<string, number> = {};

        // Count occurrences of each option_text
        votes.forEach((vote: { option_text: string }) => {
            if (!voteCounts[vote.option_text]) {
                voteCounts[vote.option_text] = 0;
            }
            voteCounts[vote.option_text] += 1;
        });

        // Convert into DataItem format
        return Object.entries(voteCounts).map(([label, value], index) => ({
            id: index,
            value: Number(value),
            label,
        }));
    };

    useEffect(() => {
        const getVotes = async (agendaId: number) => {
            try {
                const response = await fetch("/api/get-votes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ agendaId }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log("Votes:", data.votes);
                    const formattedData: DataItem[] = processVotes(data.votes);
                    setAgendaData(formattedData);
                    const totalValue = formattedData.reduce((sum, item) => sum + item.value, 0);
                    setSum(totalValue);
                } else {
                    console.error("Error fetching votes:", data.error);
                }
            } catch (error) {
                console.error("Request failed:", error);
            }
        };

        if (typeof agenda.id === "number") {
            getVotes(agenda.id);
        } else {
            console.warn("Invalid agenda ID:", agenda.id);
        }
    }, [agenda.id]); //  Stable dependency array

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (modal) {
                document.body.classList.add('active-modal');
            } else {
                document.body.classList.remove('active-modal');
            }
        }
    }, [modal]); //  Runs only when modal state changes

    const size = { width: 400, height: 500 };
    const chartData = { data: agendaData };

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
                                    arcLabel: (item) => `${(item.value / sum * 100).toFixed(2)}%`,
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
                            <Individual id={'1'} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
