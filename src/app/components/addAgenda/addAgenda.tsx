"use client";
import React, { useState, useEffect } from "react";
import styles from './addAgenda.module.css'
import BinLogo from '../../assets/bin.png'
import Image from 'next/image'



interface User {
  id: string;
}

interface ModalProps {
  user: User;
}

export default function Modal({ user }: ModalProps) {
  const [modal, setModal] = useState<boolean>(false);
  const [inputOption, setInputOption] = useState<string>("");
  const [options, setOptions]= useState<string[]>([]);
  const [inputAgenda, setInputAgenda] = useState<string>("")
  const [message, setMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const toggleModal = () => {
    setModal(!modal);
    setInputAgenda('');
    setOptions([]);
    setInputOption('');
    setDescription('');
    setMessage('');
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
  
    async function addAgenda() {
      const response = await fetch("/api/add-agenda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          speaker_id: user.id,
          title: inputAgenda,
          options:options,
          description:description
        }),
      });
    
      const data = await response.json();
      console.log(data);
    }
  
  const handleSubmit = () => {
    if (!inputAgenda){
        setMessage("Agenda is missing")
    }
    else if (options.length === 0){
        setMessage("Options are missing")
    }
    else{
      addAgenda();
      setMessage("");
      setInputAgenda('');
      setOptions([]);
      setInputOption('');
      setMessage("Added agenda successfully");
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
              <div className={styles.addOptions}>
                <input value={inputOption} placeholder="Enter Option" onChange={(e) => setInputOption(e.target.value)} onKeyDown={handleEnter}/>
                <button onClick={() => {setOptions((prev) => [...prev, inputOption]); setInputOption("");}}>+</button>
              </div>

              <label htmlFor="description">Description:</label>
                <textarea className={styles.description} name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter your description here..."  />
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