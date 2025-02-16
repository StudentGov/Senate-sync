import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';

interface AgendaProps {
  agenda: {
    agenda: string;
    visible: boolean;
    closed: boolean;
  };
}


export default function AgendaSection({ agenda }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.visible)
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          <Switch checked={visibile} onChange={handleToggle}/>
          <button onClick={() => {}}>Close</button>
          <button onClick={() => {}}>Vote</button>
        </div>    
      </div>
  );
};

