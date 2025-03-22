import { useEffect, useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';
import PieChart from '../pieChart/pieChart'

interface AgendaProps {
  agenda: {
    id:number,
    title: string;
    is_visible: boolean;
    is_open: boolean;
    created_at: string;
    options: any
  };
  page:string;
  isMember:boolean;
  isSpeaker:boolean
}
interface Option {
  id: number;
  optionText: string;
}

export default function AgendaSection({ agenda, page, isMember, isSpeaker }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<Option>( {id:-1, optionText: "N/A"} );
  function handleToggle(){
    setVisibile(!visibile)
  }
  useEffect(() => {
    async function getUserVote() {
      try {
        const response = await fetch("/api/get-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: "1234", agenda_id: agenda.id }),
        });

        const data = await response.json();
        console.log(data)
        setSelectedOption(data); // Update state with retrieved vote
      } catch (error) {
        console.error("Failed to fetch user vote:", error);
      }
    }

    getUserVote();
  }, []); // Re-fetch when voterId or agendaId changes

  return (
    <div className={styles.section}>
      <h2>{agenda.title}</h2>
      <h3 className={styles.date}>{agenda.created_at}</h3>
        <div className={styles.buttons}>
          {isMember && <small>{selectedOption.optionText}</small>}
          {isSpeaker && <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>}
          {page==='current'?(
            <>
              {isSpeaker && <button onClick={() => {agenda.is_open=true}}>Close</button>}
              {/* <PieChart id={agenda.id} agendaName={agenda.title}/> */}
              {isMember && <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption} text={'Vote'}/>}
            </>
          ):<></>
          // <PieChart id={agenda.id} agendaName={agenda.title}/>
          }
        </div>    
      </div>
  );
};

