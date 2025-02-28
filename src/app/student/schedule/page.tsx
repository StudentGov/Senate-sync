'use client';
import React, { useState } from 'react'
import styles from './schedule.module.css'
import Calendar from '../../components/schedulingCalendar/schedulingCalendar'
import TimeSlots from '../../components/timeslots/timeSlots';
import Data from '../../db.json'

// Importing dayjs for date manipulation
import dayjs /*, { Dayjs }*/ from 'dayjs';
// Commented out Dayjs type because it's currently unused, but it may be needed later

// Define the shape of Data
interface DataType {
  [key: string]: string[]; // The keys are dates (strings) and the values are arrays of strings (time slots)
}

// Explicitly type the imported Data object
const ScheduleData: DataType = Data;

export default function SchedulingPage(){
    const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format("YYYY-MM-DD")); // Initialize to today's date
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    
    return (
        <div className={styles.schedulingPage}>
            <Calendar selectedTime={selectedTime} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            <TimeSlots slots={selectedDate? ScheduleData[selectedDate] :[]} selectedTime={selectedTime} setSelectedTime={setSelectedTime}/>
            
        </div>
    )
}