import { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import styles from './individual.module.css'

interface Props{
    agenda_id:number
}
interface VoteData{
    id: number,
    name: string,
    option: string
}

export default function Individual({agenda_id}: Props){
    const [modal, setModal] = useState<boolean>(false);
    const [voteData, setVoteData] = useState<VoteData[]>([])
    const toggleModal = () => {
        setModal(!modal);
    };
    useEffect(() => {
        fetchVotes();
    }, [])
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
          const response = await fetch('/api/get-individual-votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agenda_id: agenda_id }),
          });
      
          if (!response.ok) throw new Error('Failed to fetch votes');
      
          const data = await response.json();
          console.log('Fetched Votes:', data);
          setVoteData(data.data)
        } catch (error) {
          console.error('Error fetching votes:', error);
        }
      }
      
    return (
<>
            <button onClick={toggleModal} className={styles.btnModal}>Individual Stats</button>

            {modal && ReactDOM.createPortal(
                <div className={styles.modal}>
                    <div onClick={toggleModal} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        <h2 className={styles.title}>Ind stats</h2>
                        <button className={styles.closeModal} onClick={toggleModal}>back</button>
                        <div className={styles.sections}>
                            <div className={styles.content}>
                                {voteData?.map((item, indx) => {
                                    return (
                                        <div key={indx} className={styles.section}>
                                            <h2 className={styles.name}>{item.id}. {item.name}</h2>   
                                            <h2 className={styles.option}>{item.option}</h2>
                                        </div>
                                    )
                                    })}
                              </div>   
                        </div>                      
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

