import { useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';
import PieChart from '../../components/pieChart/pieChart'

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
  const [selectedOption, setSelectedOption] = useState<string>("");
  function handleToggle(){
    setVisibile(!visibile)
  }
  return (
    <div className={styles.section}>
      <h2>{agenda.agenda}</h2>
        <div className={styles.buttons}>
          {selectedOption}
          <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>
          {page==='current'?(
            <>
              <button onClick={() => {}}>Close</button>
              <PieChart id={agenda.id} agendaName={agenda.agenda}/>
              <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption}/>
            </>
          ):<button onClick={() => {}}>View Voting</button>
          }
        </div>    
      </div>
  );
};

