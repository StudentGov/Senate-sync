import { useEffect, useState } from 'react';
import styles from './agendaSection.module.css';
import Switch from '@mui/material/Switch';
import DropDownOptions from '../dropDown/dropDown';
import PieChart from '../pieChart/pieChart';

interface AgendaProps {
  agenda: {
    id: number;
    title: string;
    is_visible: boolean;
    is_open: boolean;
    options: string[];
    created_at: string;
    user: number;
  };
  page: string;
  isMember: boolean;
  isSpeaker: boolean;
  user: { id: number }; //  Ensured user property exists
  vote: () => Promise<unknown>; //  Kept vote as a separate function
}

export default function AgendaSection({ agenda, page, isMember, isSpeaker, user, vote }: AgendaProps) {
  const [visibile, setVisibile] = useState<boolean>(agenda.is_visible);
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    if (!selectedOption) {
      vote()
        .then((res: unknown) => {
          const result = res as { data?: { option_text?: string } }; //  Marked `data` and `option_text` as optional

          if (result.data && result.data.option_text) {
            console.log('Vote result:', result.data.option_text);
            setSelectedOption(result.data.option_text);
          } else {
            console.warn("No valid vote data received:", result); //  Logs a warning if data is missing
          }
        })
        .catch((err: unknown) => {
          console.error('Vote error:', err);
        });
    } else {
      async function updateVote() {
        try {
          const response = await fetch('/api/update-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              voter_id: user.id,
              agenda_id: agenda.id,
              vote: selectedOption,
            }),
          });

          const result = await response.json();
          console.log('Update result:', result);
        } catch (error) {
          console.error("Error updating vote:", error);
        }
      }
      updateVote();
    }
  }, [selectedOption, agenda.id, user.id, vote]); //  Ensures all dependencies are included

  async function handleToggle() {
    const newVisibility = !visibile;
    setVisibile(newVisibility);

    try {
      const response = await fetch('/api/update-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agenda.id, visible: newVisibility }),
      });

      const json = await response.json();
      if (!response.ok) {
        console.error('API error:', json.error);
      } else {
        console.log('Insert successful:', json);
      }
    } catch (error) {
      console.error("Error updating agenda visibility:", error);
    }
  }

  const closeAgenda = async () => {
    try {
      const response = await fetch("/api/handle-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        {isSpeaker && <Switch checked={visibile} onChange={handleToggle} className={styles.toggle} />}
        {page === 'current' ? (
          <>
            {isSpeaker && <button onClick={closeAgenda}>Close</button>}
            <PieChart agenda={agenda} />
            {isMember && <DropDownOptions options={agenda.options} setSelectedOption={setSelectedOption} text={'Vote'} />}
          </>
        ) : (
          <PieChart agenda={agenda} />
        )}
      </div>
    </div>
  );
}
