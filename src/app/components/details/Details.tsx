'use client'; 
import { useEffect } from 'react';
import styles from './details.module.css'

interface AgendaProps {
    agenda: {
      id:number,
      title: string;
      is_visible: boolean;
      is_open: boolean;
      created_at: string;
      description: string
    };
    showDetails: boolean;
    setShowDetails: (details: boolean) => void;
    selectedVote: string;
}

export default function Details({agenda, showDetails, setShowDetails, selectedVote}: AgendaProps){

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };
    // UseEffect to manage modal state safely on the client side
    useEffect(() => {
        if (showDetails) {
            document.body.classList.add("active-modal");
        } else {
            document.body.classList.remove("active-modal");
        }
    }, [showDetails]);

      
    return (
        <>
            {showDetails && (
                <div className={styles.modal}>
                    <div onClick={toggleDetails} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        <button className={styles.closeModal} onClick={toggleDetails}>back</button>
                        <div className={styles.detailsContainer}>
                            <h2 className={styles.title}>Details</h2>
                            <hr/>
                            <div className={styles.infoSection}>
                                <div className={styles.infoRow}>
                                    <span className={styles.bold}>Title: </span> {agenda.title}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.bold}>Your vote: </span> {selectedVote}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.bold}> - Status:</span> {agenda.is_visible ? 'Visible' : 'Hidden'}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.bold}> - Open to vote:</span> {agenda.is_open ? 'Yes' : 'No'}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.bold}> - Created At:</span> {new Date(agenda.created_at).toISOString().split("T")[0]}
                                </div>
                            </div>

                            <div className={styles.descriptionSection}>
                                <span className={styles.bold}> - Description:</span>
                                <p>{agenda.description}</p>
                            </div> 
                        </div>                      
                    </div>
                </div>
            )}
        </>
    )
}
