import { useState } from 'react';
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
    options:string[];
    created_at: string
  };
  page:string;
  isMember:boolean;
  isSpeaker:boolean
}


export default function AgendaSection({ agenda, page, isMember, isSpeaker }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<string>("N/A");
  console.log(agenda.id)
  async function handleToggle(){
    // Flip the local state first
    const newVisibility = !visibile;
    setVisibile(newVisibility);
    async function callInsertAPI() {
      console.log("In call insert api function")
        const response = await fetch('/api/update-agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: agenda.id,
            visible:newVisibility
          }),
        })
        const json = await response.json()
        if (!response.ok) {
          console.error('API error:', json.error)
        } else {
          console.log('Insert successful:', json)
        }
      }
    callInsertAPI()
  }
  
  return (
    <div className={styles.section}>
      <h2>{agenda.title}</h2>
      <h3 className={styles.date}>{agenda.created_at}</h3>
        <div className={styles.buttons}>
          {isMember && <small>{selectedOption}</small>}
          {isSpeaker && <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>}
          {page==='current'?(
            <>
              {isSpeaker && <button onClick={() => {agenda.is_open=true}}>Close</button>}
              <PieChart id={'1'} agendaName={agenda.title}/>
              {isMember && <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption} text={'Vote'}/>}
            </>
          ):<PieChart id={'1'} agendaName={agenda.title}/>
          }
        </div>    
      </div>
  );
};

