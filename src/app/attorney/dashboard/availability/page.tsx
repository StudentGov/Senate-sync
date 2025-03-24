"use client";
import styles from './availability.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function AvailabilityContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Enter availability title (e.g. "Available")');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  };

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
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            editable={true}
            height="auto"
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
