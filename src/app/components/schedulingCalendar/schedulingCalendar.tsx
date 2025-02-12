"use client";
import React from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import style from './schdeulingCalendar.module.css'

 

interface Props {
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
  }

export default function Calendar({selectedDate, setSelectedDate}:Props) {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  const router = useRouter();  // Get the router object

  const handleDateChange = (newDate: any) => {
    // console.log(typeof(newDate.format("dddd, MMMM D, YYYY")), newDate.format("dddd, MMMM D, YYYY"))
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };
  return (
    <div className={style.calendar}>
      {`Selected date: ${selectedDate}`}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={value} onChange={handleDateChange} />
      </LocalizationProvider>
      <button className={style.scheduleButton} onClick={() => router.push('/schedule/info')}>Schedule</button>
    </div>

  );
}