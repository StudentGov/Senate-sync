import { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
// import { desktopOS, valueFormatter } from './webUsageStats';
import Data from '../../voting.json'

import styles from './pieChart.module.css'

interface DataItem {
    id: number;
    value: number;
    label: string;
  }
  
interface DataObject {
    [key: string]: {
      data: DataItem[];
    };
  }
  
export default function PieChartPopUp({id, agendaName}: {id:string, agendaName:string}) {
    const [modal, setModal] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0);

    const toggleModal = () => {
    setModal(!modal);
    };

    useEffect(() => {
        // Get the data for the specific id
        const data = (Data[id]?.data || []) as DataItem[];
    
        // Calculate the sum of values
        const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    
        // Update state
        setSum(totalValue);
      }, [id]);

    if(modal) {
    document.body.classList.add('active-modal')
    } else {
    document.body.classList.remove('active-modal')
    }

    const size = {width: 400,height: 500,};
    const data = {data: Data[id]?.data || [],};
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
                    ...data,
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

