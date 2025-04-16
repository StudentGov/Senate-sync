// Paste this full updated code in your `availability/page.tsx` file

"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import styles from './availability.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';
import availability from '../../../availability.json';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg } from '@fullcalendar/core';

function AvailabilityContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();
  const { user } = useUser();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [isAllDay, setIsAllDay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availabilityEvents = useMemo(() => {
    const events: EventInput[] = [];
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

  const timeSlots = Array.from({ length: 36 }, (_, i) => {
    const hour = 6 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  });

  // ✅ Works for all views (week/day/month)
  const handleSelect = (info: DateSelectArg) => {
    const clickedDate = info.startStr.split("T")[0];
    const localStart = info.start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const localEnd = info.end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    setStartTime(localStart);
    setEndTime(localEnd);
    setSelectedDate(clickedDate);
  };

  const handleAddAvailability = async () => {
    if (!selectedDate || !startTime || !endTime) return;
  
    const availabilityData = {
      attorney_id: user?.id, // from Clerk
      attorney_name: user?.fullName || "Unknown",
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    };
  
    try {
      const res = await fetch("/api/add-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availabilityData),
      });
  
      if (res.ok) {
        console.log("✅ Availability saved successfully");
      } else {
        console.error("❌ Failed to save availability");
      }
    } catch (err) {
      console.error("⚠️ Error adding availability:", err);
    }
  
    // Clear modal for new entry
    setSelectedDate(null);
    setIsAllDay(false);
  };
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectedDate(null);
        setIsAllDay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.availabilityPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Attorney Availability</h1>
          <div className={styles.navButtons}>
            <button onClick={() => router.push('/attorney/dashboard/upcomingAppointments')}>
              Upcoming Appointments
            </button>
          </div>
        </div>

        <div className={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={availabilityEvents}
            editable={false}
            selectable={true}
            allDaySlot={true}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            select={handleSelect}
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

        {selectedDate && (
          <div ref={dropdownRef} className={styles.dropdownContainer}>
            <h4>Select availability for {selectedDate}</h4>

            <div className={styles.timeRow}>
              <label>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsAllDay(checked);
                    if (checked) {
                      setStartTime("08:00 AM");
                      setEndTime("05:00 PM");
                    }
                  }}
                />{" "}
                All Day (8 AM – 5 PM)
              </label>
            </div>

            <div className={styles.timeRow}>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isAllDay}
              >
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
              <span>to</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isAllDay}
              >
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
              <button className={styles.addButton} onClick={handleAddAvailability}>
                Add
              </button>
            </div>
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
