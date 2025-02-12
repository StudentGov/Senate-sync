'use client';
import React, { useState } from 'react'
import styles from './schedule.module.css'
import Calendar from '../components/schedulingCalendar/schedulingCalendar'
import TimeSlots from '../components/timeslots/timeSlots';

export default function SchedulingPage(){
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const slots = [
        "9:00 am",
        "9:15 am",
        "9:30 am",
        "9:45 am",
        "10:00 am",
        "10:15 am",
        "10:30 am",
        "10:45 am",
        "11:00 am",
        "11:15 am",
        "11:30 am",
      ];
    return (
        <div className={styles.schedulingPage}>


            <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            <TimeSlots slots={slots} setSelectedTime={setSelectedTime}/>
            
        </div>
    )
}