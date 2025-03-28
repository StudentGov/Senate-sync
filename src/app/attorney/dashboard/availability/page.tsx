"use client";

import { useMemo } from 'react';
import styles from './availability.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';
import availability from '../../../availability.json';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function AvailabilityContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();

  // Convert JSON availability to FullCalendar events
  const availabilityEvents = useMemo(() => {
    const events: any[] = [];

    Object.entries(availability).forEach(([date, times]) => {
      (times as string[]).forEach((timeRange) => {
        const [startTime, endTime] = timeRange.split(' - ');

        const start = new Date(`${date} ${startTime}`);
        const end = new Date(`${date} ${endTime}`);

        events.push({
          title: 'Available',
          start,
          end,
          allDay: false,
        });
      });
    });

    return events;
  }, []);

  return (
    <div className={styles.availabilityPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Attorney Availability</h1>
        </div>
        <div className={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={availabilityEvents}
            selectable={false}
            editable={false}
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
