import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';

interface AgendaProps {
  agenda: {
    agenda: string;
    visible: boolean;
    closed: boolean;
  };
  page:string
}


export default function AgendaSection({ agenda, page }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.visible)
  const [selectedOption, setSelectedOption] = useState<string>("");
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          {selectedOption}
          <Switch checked={visibile} onChange={handleToggle}/>
          {page==='current'?(
            <>
              <button onClick={() => {}}>Close</button>
              <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption}/>
            </>
          ):<button onClick={() => {}}>View Voting</button>
          }
        </div>    
      </div>
  );
};

