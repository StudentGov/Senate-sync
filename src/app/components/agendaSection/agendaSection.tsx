import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';
import PieChart from '../pieChart/pieChart'

interface AgendaProps {
  agenda: {
    id:string,
    agenda: string;
    visible: boolean;
    closed: boolean;
    options:string[];
  };
  page:string;
  isMember:boolean;
  isSpeaker:boolean
}


export default function AgendaSection({ agenda, page, isMember, isSpeaker }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.visible)
  const [selectedOption, setSelectedOption] = useState<string>("N/A");
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          {isMember && <small>{selectedOption}</small>}
          {isSpeaker && <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>}
          {page==='current'?(
            <>
              {isSpeaker && <button onClick={() => {agenda.closed=true}}>Close</button>}
              <PieChart id={agenda.id} agendaName={agenda.agenda}/>
              {isMember && <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption}/>}
            </>
          ):<PieChart id={agenda.id} agendaName={agenda.agenda}/>
          }
        </div>    
      </div>
  );
};

