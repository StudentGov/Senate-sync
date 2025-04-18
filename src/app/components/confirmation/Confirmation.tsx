'use client'; 
import { useEffect } from 'react';
import styles from './confirmation.module.css'

interface ConfirmationProps {

    showConfirmation: boolean;
    setShowConfirmation: (confirmation: boolean) => void;
    setConfirmationOption: (option: string) => void;
    vote: string;
}

export default function Confirmation({showConfirmation, setShowConfirmation, setConfirmationOption, vote}: ConfirmationProps){

    const toggleConfirmation = () => {
        setShowConfirmation(!showConfirmation);
    };
    // UseEffect to manage modal state safely on the client side
    useEffect(() => {
        if (showConfirmation) {
            document.body.classList.add("active-modal");
        } else {
            document.body.classList.remove("active-modal");
        }
    }, [showConfirmation]);

      
    return (
        <>
            {showConfirmation && (
                <div className={styles.modal}>
                    <div onClick={toggleConfirmation} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        <div className={styles.confirmationContainer}>
                            <div>
                                <h1 style={{color:"black"}}>Are you sure you want to vote for "{vote}"?</h1>
                                <p style={{color:"red"}}>CAUTION!. THIS ACTION CAN'T BE UNDONE!</p>
                            </div>
                            <div className={styles.buttons}>
                                <button onClick={toggleConfirmation} style={{backgroundColor:"red"}}>Cancel</button>
                                <button onClick={() => setConfirmationOption("confirm")} style={{backgroundColor:"green"}}>Confirm</button>
                            </div>

                        </div>                   
                    </div>
                </div>
            )}
        </>
    )
}
