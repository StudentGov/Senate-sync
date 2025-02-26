'use client';
import React, { useState } from 'react'
import styles from './schedule.module.css'
import Calendar from '../../components/schedulingCalendar/schedulingCalendar'
import TimeSlots from '../../components/timeslots/timeSlots';
import Data from '../../db.json'
import dayjs, { Dayjs } from 'dayjs';

export default function SchedulingPage(){
    const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format("YYYY-MM-DD")); // Initialize to today's date
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    

    return (
        <div className={styles.schedulingPage}>
            <Calendar selectedTime={selectedTime} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            <TimeSlots slots={selectedDate? Data[selectedDate] :[]} selectedTime={selectedTime} setSelectedTime={setSelectedTime}/>
            
        </div>
    )
}