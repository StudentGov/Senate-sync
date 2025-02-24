"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import style from './SchdeulingCalendar.module.css'

 

interface Props {
    selectedDate: string | null;
    selectedTime: string | null;
    setSelectedDate: (date: string | null) => void;
  }

export default function Calendar({selectedTime ,selectedDate, setSelectedDate}:Props) {
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [message, setMessage] = useState('')
  const router = useRouter();  // Get the router object

  const handleDateChange = (newDate: any) => {
    // console.log(typeof(newDate.format("dddd, MMMM D, YYYY")), newDate.format("dddd, MMMM D, YYYY"))
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };
  const handleClick = () => {
    if (selectedTime){
      router.push('/schedule/info')
    }else{
      setMessage(" Please select a time")
    }
    
  }


  return (
    <div className={style.calendar}>
      {`Selected date: ${selectedDate}`}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={value} onChange={handleDateChange} />
      </LocalizationProvider>
      <button className={style.scheduleButton} onClick={handleClick}>Schedule</button>
      {message}
    </div>

  );
}