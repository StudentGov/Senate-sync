import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/DropDown'
import PieChart from '../pieChart/PieChart'

interface AgendaProps {
  agenda: {
    id:string,
    agenda: string;
    visible: boolean;
    closed: boolean;
    options:string[];
  };
  page:string
}


export default function AgendaSection({ agenda, page }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.visible)
  const [selectedOption, setSelectedOption] = useState<string>("N/A");
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          <small>{selectedOption}</small>
          <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>
          {page==='current'?(
            <>
              <button onClick={() => {agenda.closed=true}}>Close</button>
              <PieChart id={agenda.id} agendaName={agenda.agenda}/>
              <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption}/>
            </>
          ):<PieChart id={agenda.id} agendaName={agenda.agenda}/>
          }
        </div>    
      </div>
  );
};

