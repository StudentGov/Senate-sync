import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Data from '../../voting.json';
// import { desktopOS, valueFormatter } from './webUsageStats';
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

export default function PieChartPopUp({id, agendaName}: {id:string, agendaName:string}) {
    const [modal, setModal] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0);

    const toggleModal = () => {
        setModal(!modal);
    };

    // Calculate the sum of values
    useEffect(() => {
        // Get the data for the specific id
        const agendaData = (VotingData[id]?.data || []) as DataItem[]; // Fixed TypeScript error
    
        // Calculate the sum of values
        const totalValue = agendaData.reduce((sum, item) => sum + item.value, 0);
    
        // Update state
        setSum(totalValue);
    }, [id]);

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
    const chartData = { data: VotingData[id]?.data || [] }; // Fixed TypeScript error

    return (
        <>
            <button onClick={toggleModal} className={styles.btnModal}>View Voting</button>

            {modal && (
                <div className={styles.modal}>
                    <div onClick={toggleModal} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        <h2 className={styles.title}>{agendaName}</h2>
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
                            <button onClick={() => {}}>Individual Stats</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
