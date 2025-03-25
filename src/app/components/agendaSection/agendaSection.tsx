import { useEffect, useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';
import PieChart from '../pieChart/pieChart'

interface Option {
  id: number;
  optionText: string;
}
interface User {
  id: string;
  firstName: string,
  lastName: string
}

interface AgendaProps {
  agenda: {
    id:number,
    title: string;
    is_visible: boolean;
    is_open: boolean;
    created_at: string;
    options: Option[]
  };
  page:string;
  isMember:boolean;
  isSpeaker:boolean;
  user: User
}


export default function AgendaSection({ agenda, page, isMember, isSpeaker, user }: AgendaProps){
  const [visible, setVisible] = useState<boolean>(agenda.is_visible)
  const [selectedOption, setSelectedOption] = useState<Option>( {id:-1, optionText: "N/A"} );
  const [userChangedVote, setUserChangedVote] = useState<boolean>(false);
  // Toggle the visibility
  async function handleToggle() {
    // Toggle the visibility
    const newVisibility = !visible;
    setVisible(newVisibility);

    // Call API to update visibility in the database
    try {
      const response = await fetch("/api/update-agenda-visibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agenda_id: agenda.id,
          is_visible: newVisibility,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Visibility for "${agenda.title}" updated successfully`);
      } else {
        console.error(`Failed to update visibility for "${agenda.title}":`, data.error);
      }
    } catch (error) {
      console.error(`Error updating visibility for "${agenda.title}":`, error);
    }
  }

  async function handleClose(){
    // Call API to update visibility in the database
    try {
      const response = await fetch("/api/handle-close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agenda_id: agenda.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Agenda "${agenda.title}" closed successfully:`, data.message);
      } else {
        console.error(`Failed to close agenda "${agenda.title}":`, data.error);
      }
    } catch (error) {
      console.error(`Error closing agenda "${agenda.title}":`, error);
    }
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
          setSelectedOption({ id: -1, optionText: "N/A" });
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
      setUserChangedVote(false);

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
        if (response.ok) {
          console.log(`Success adding/updating vote: for "${agenda.title}"`);
        } else {
          console.log("Error:", data.error);
        }
      } catch (error) {
        console.error(`Error submitting vote for "${agenda.title}":`, error);
        alert("Error submitting vote");
      }
    }

    // Only call the API if selectedOption has a valid optionText
    // if (selectedOption && selectedOption.optionText !== "N/A" && selectedOption.id !== null && selectedOption.id > -1) {
    //   handleVoteSubmit();
    // }
    if (userChangedVote){
      handleVoteSubmit();
    }

  }, [selectedOption, user.id, agenda.id]); // Re-run when selectedOption changes
  return (
    <div className={styles.section}>
      <h2>{agenda.title}</h2>
      <h3 className={styles.date}>{new Date(agenda.created_at).toLocaleDateString("en-CA")}</h3>
        <div className={styles.buttons}>
          {isMember && <small>{selectedOption.optionText}</small>}
          {isSpeaker && <Switch checked={visible} onChange={handleToggle} className={styles.toggle}/>}
          {page==='current'?(
            <>
              {isSpeaker && <button onClick={handleClose}>Close</button>}
              <PieChart agenda={agenda} isSpeaker={isSpeaker}/>
              {isMember && <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption} text={'Vote'} setUserChangedVote={setUserChangedVote}/>}
            </>
          ):<PieChart agenda={agenda} isSpeaker={isSpeaker}/>
          }
        </div>    
      </div>
  );
};

