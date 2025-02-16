import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';

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
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          <Switch checked={visibile} onChange={handleToggle}/>
          {page==='current'?(
            <>
              <button onClick={() => {}}>Close</button>
              <button onClick={() => {}}>Vote</button>
            </>
          ):<button onClick={() => {}}>View Voting</button>
          }
        </div>    
      </div>
  );
};

