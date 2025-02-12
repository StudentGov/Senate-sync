'use client';
import React, { useState } from 'react'
import styles from './schedule.module.css'
import Calendar from '../components/schedulingCalendar'


export default function SchedulingPage(){
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    return (
        <div className={styles.schedulingPage}>
            <h1>Scheduling Page</h1>
            <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            {selectedDate}
        </div>
    )
}