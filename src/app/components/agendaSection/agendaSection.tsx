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
  isSpeaker:boolean;
  user: any
}
interface Option {
  id: number|null;
  optionText: string|null;
}

export default function AgendaSection({ agenda, page, isMember, isSpeaker, user }: AgendaProps){
  const [visibile, setVisibile] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<Option>( {id:-1, optionText: null} );
  function handleToggle(){
    setVisibile(!visibile)
  }

  // Fetch the user's vote when the component mounts or when user or agenda changes
  useEffect(() => {
    async function getUserVote() {
      try {
        const response = await fetch("/api/get-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voter_id: user.id, agenda_id: agenda.id }),
        });

        const data = await response.json();
        // If the user hasn't voted, set default "N/A", else set the option data
        if (data.optionText === "N/A" || !data.optionText) {
          setSelectedOption({ id: null, optionText: "N/A" });
        } else {
          setSelectedOption({ id: data.option_id, optionText: data.optionText });
        }
      } catch (error) {
        console.error("Failed to fetch user vote:", error);
      }
    }

    getUserVote();
  }, [user.id, agenda.id]); // Re-fetch when voterId or agendaId changes

  // Handle vote submission (called every time selectedOption changes)
  useEffect(() => {
    async function handleVoteSubmit() {
      if (!selectedOption || selectedOption.optionText === "N/A") {
        alert("Please select an option");
        return;
      }

      try {
        const response = await fetch("/api/update-user-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voter_id: user.id,
            agenda_id: agenda.id,
            name: `${user.firstName} ${user.lastName}`,
            option_id: selectedOption.id,
          }),
        });

        const data = await response.json();
        console.log(data)
        if (response.ok) {
          console.log("Success adding/updating vote:", data.message);
        } else {
          console.log("Error:", data.error);
        }
      } catch (error) {
        console.error("Error submitting vote:", error);
        alert("Error submitting vote");
      }
    }

    // Only call the API if selectedOption has a valid optionText
    if (selectedOption && selectedOption.optionText !== "N/A" && selectedOption.id !== null && selectedOption.id > -1) {
      handleVoteSubmit();
    }

  }, [selectedOption, user.id, agenda.id]); // Re-run when selectedOption changes
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

