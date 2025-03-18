'use client' 
import React, { useState, useEffect } from "react";
import styles from './addAgenda.module.css'
import BinLogo from '../../assets/bin.png'
import Image from 'next/image'
import AgendaData from '../../agendas.json'


export default function Modal() {
  const [modal, setModal] = useState<boolean>(false);
  const [inputOption, setInputOption] = useState<string>("");
  const [options, setOptions]= useState<string[]>([]);
  const [inputAgenda, setInputAgenda] = useState<string>("")
  const [message, setMessage] = useState<string>("");

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

  const handleSubmit = () => {
    if (!inputAgenda){
        setMessage("Agenda is missing")
    }
    else if (options.length === 0){
        setMessage("Options are missing")
    }
    else{
      setMessage("");
      // const newAgenda = {id:(AgendaData.length).toString(), agenda:inputAgenda, visible:false, closed:false, options:options}
      // AgendaData.push(newAgenda)
      setInputAgenda('');
      setOptions([]);
      setInputOption('');
      setMessage("Added agenda successfully");
      const newRow = {
        title:inputAgenda,
        is_visible: true,
        is_open: true,
        options:{'options':options}
    }
      callInsertAPI(newRow);
    }
  }
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputOption){
      e.preventDefault(); // Prevents any default behavior like form submission
      setOptions((prev) => [...prev, inputOption]); // Add new option
      setInputOption(""); // Clear input field
    }
  }
  const handleDelete = (option: string) => {
    setOptions((prev) => prev.filter(item => item !== option))
  }
  // Example call from a front-end (React, Next.js, etc.)
  async function callInsertAPI(newRow) {
    console.log("In call insert api function")
    const response = await fetch('/api/insert-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'Agendas',
        newRow:newRow
        // newRow: { title: 'Some Title', description: 'Some Description' },
      }),
    })

    const json = await response.json()
    if (!response.ok) {
      console.error('API error:', json.error)
    } else {
      console.log('Insert successful:', json)
    }
  }



  return (
    <>
      <button onClick={toggleModal} className={styles.btnModal}>Add Agenda</button>

      {modal && (
        <div className={styles.modal}>
          <div onClick={toggleModal} className={styles.overlay}></div>
          <div className={styles.modalContent}>
            <button className={styles.closeModal} onClick={toggleModal}>CLOSE</button>
            <div className={styles.inputs}>
              <label htmlFor="inputField">Write Agenda</label>
                <input value={inputAgenda} placeholder="Enter Agenda" onChange={(e) => setInputAgenda(e.target.value)} required />
              <label htmlFor="inputField">Add Option</label>
                <input value={inputOption} placeholder="Enter Option" onChange={(e) => setInputOption(e.target.value)} onKeyDown={handleEnter}/>
            </div>
            <div className={styles.options}>
              <span>Options</span>
              <div className={styles.content}>
                {options.map((option, index) => (
                  <div key={index} className={styles.option}>
                    <span>{option}</span>
                                <Image src={BinLogo} alt='X' onClick={() => handleDelete(option)} className={styles.delete}/>
                  </div>
                            
                ))}
              </div>
            </div>



            <div className={styles.push}>
              {message}
              <button onClick={handleSubmit}>Push Agenda</button>
            </div>

          </div>
        </div>
      )}
      
    </>
  );
}