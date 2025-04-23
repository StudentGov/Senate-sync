"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import style from './schdeulingCalendar.module.css'
import ConfirmationPopup from '../ConfirmationPopup';

interface Props {
    selectedDate: string | null;
    selectedTime: string | null;
    setSelectedDate: (date: string | null) => void;
    setSelectedTime: (time: string | null) => void;
  }

export default function Calendar({selectedTime, selectedDate, setSelectedDate,setSelectedTime}: Props) {
  const [value /*, setValue*/] = useState<Dayjs | null>(dayjs());
  // Commented out setValue because it's currently unused, but it may be needed later

  const [message, setMessage] = useState('')
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();  // Get the router object

  // TypeScript Fix: Use Dayjs | null instead of any
  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate.format('YYYY-MM-DD'));
    } else {
      setSelectedDate(null);
    }
  
    setSelectedTime(null);// ✅ Reset time when date changes
    setMessage('');
    setShowPopup(false);
  };
  
  

  const handleClick = () => {
    if (!selectedTime) {
      setMessage('⚠️ Please select a time before scheduling.');
      return;
    }
  
    setShowPopup(true);
    setMessage('');
  };
  

  const confirmSchedule = (starId: string, techId: string, description: string) => {
    setShowPopup(false);
    console.log("Confirmed with:", { starId, techId, description });
    // You could pass these values to an API or router.push with query
    router.push('/schedule/info');
  };

  const cancelSchedule = () => {
    setShowPopup(false);
  };

  return (
    <div className={style.calendar}>
      <div>{`Selected date: ${selectedDate}`}</div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={value} onChange={handleDateChange} />
      </LocalizationProvider>

      <button className={style.scheduleButton} onClick={handleClick}>Schedule</button>
      {message}

      {showPopup && (
        <ConfirmationPopup
          onConfirm={confirmSchedule}
          onCancel={cancelSchedule}
        />
      )}
    </div>
  );
}
