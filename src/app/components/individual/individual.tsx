import { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import styles from './individual.module.css'
import voteData from '../../individual.json'

interface Props{
    id:string
}

export default function Individual({id}: Props){
    const [modal, setModal] = useState<boolean>(false);
    const toggleModal = () => {
        setModal(!modal);
    };
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
                                {voteData[id].map((item, indx) => {
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

