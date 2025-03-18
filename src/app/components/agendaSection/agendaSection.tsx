import { useDebugValue, useEffect, useState } from 'react';
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
    created_at: string;
    user: number,
    vote: () => Promise<any>
  };
  page:string;
  isMember:boolean;
  isSpeaker:boolean
}


export default function AgendaSection({ agenda, page, isMember, isSpeaker, user, vote }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  useEffect(() => {
    // Call the function once when this component first mounts
    if (!selectedOption){
      vote()
        .then((res: any) => {
          console.log('Vote result:', res.data.option_text);
          setSelectedOption(res.data.option_text)
          // setResult(res);
        })
        .catch((err: any) => {
          console.error('Vote error:', err);
        });
    } else {
      // If we *do* have a selectedOption, update that vote in the DB
      async function updateVote() {
        const response = await fetch('/api/update-vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voter_id: user.id,
            agenda_id: agenda.id,
            vote: selectedOption,
          }),
        });
        // Possibly handle response or errors here
        const result = await response.json();
        console.log('Update result:', result);
      }
  
      // Call it!
      updateVote();
    }

  }, [selectedOption]); // If `vote` doesn't change, this runs only on mount
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
  const closeAgenda = async () => {
    try {
      const response = await fetch("/api/handle-close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: agenda.id }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Agenda closed successfully:", data);
      } else {
        console.error("Error closing agenda:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };
  return (
    <div className={styles.section}>
      
      <h2>{agenda.title}</h2>
      <h3 className={styles.date}>{new Date(agenda.created_at).toLocaleDateString("en-US")}</h3>
        <div className={styles.buttons}>
          {isMember && <small>{selectedOption}</small>}
          {isSpeaker && <Switch checked={visibile} onChange={handleToggle} className={styles.toggle}/>}
          {page==='current'?(
            <>
              {isSpeaker && <button onClick={closeAgenda}>Close</button>}
              <PieChart id={'1'} agendaName={agenda.title}/>
              {isMember && <DropDownOptions options={agenda.options.options} setSelectedOption={setSelectedOption} text={'Vote'}/>}
            </>
          ):<PieChart id={'1'} agendaName={agenda.title}/>
          }
        </div>    
      </div>
  );
};

