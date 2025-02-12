"use client";
import React from "react";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';


interface TestProps {
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
  }

export default function ({selectedDate, setSelectedDate}:TestProps) {
    const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17'));

  const handleDateChange = (newDate: any) => {
    // console.log(typeof(newDate.format("dddd, MMMM D, YYYY")), newDate.format("dddd, MMMM D, YYYY"))
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };
  return (
    <div className="test">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={value} onChange={handleDateChange} />
      </LocalizationProvider>
    </div>

  );
}