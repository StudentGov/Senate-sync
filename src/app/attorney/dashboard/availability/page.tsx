"use client";

import { useMemo, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './availability.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';
import availability from '../../../availability.json';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const timeChunks = Array.from({ length: 18 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = ((hour - 1) % 12 + 1).toString();
  const start = `${formattedHour}:${minutes} ${suffix}`;

  const nextHour = 8 + Math.floor((i + 1) / 2);
  const nextMinutes = (i + 1) % 2 === 0 ? '00' : '30';
  const nextSuffix = nextHour >= 12 ? 'PM' : 'AM';
  const nextFormattedHour = ((nextHour - 1) % 12 + 1).toString();
  const end = `${nextFormattedHour}:${nextMinutes} ${nextSuffix}`;

  return `${start} - ${end}`;
});

function AvailabilityContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>(timeChunks[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const availabilityEvents = useMemo(() => {
    const events: any[] = [];

    Object.entries(availability).forEach(([date, times]) => {
      (times as string[]).forEach((timeRange) => {
        const [startTime, endTime] = timeRange.split(' - ');
        const start = new Date(`${date} ${startTime}`);
        const end = new Date(`${date} ${endTime}`);
        events.push({ title: 'Available', start, end, allDay: false });
      });
    });

    return events;
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    const viewType = calendarApi.view.type;
  
    if (viewType === "dayGridMonth") {
      const dateStr = selectInfo.startStr.split('T')[0];
      setSelectedDate(dateStr);
      setShowDropdown(true);
    }
  };
  

  const handleAddAvailability = () => {
    console.log(`Added availability on ${selectedDate} at ${selectedTime}`);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.availabilityPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Attorney Availability</h1>
          <div className={styles.navButtons}>
            <button onClick={() => router.push('/attorney/dashboard/upcomingAppointments')}>Upcoming Appointments</button>
            <button onClick={() => router.push('/attorney/dashboard/availability')}>Availability</button>
          </div>
        </div>

        <div className={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={availabilityEvents}
            selectable={true}
            editable={false}
            select={handleDateSelect}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
            }}
          />
        </div>

        {showDropdown && selectedDate && (
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <h4>Select availability for {selectedDate}</h4>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={styles.dropdown}
            >
              {timeChunks.map((chunk) => (
                <option key={chunk} value={chunk}>
                  {chunk}
                </option>
              ))}
            </select>
            <button onClick={handleAddAvailability} className={styles.addButton}>Add</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <CollapsedProvider>
      <AvailabilityContent />
    </CollapsedProvider>
  );
}
