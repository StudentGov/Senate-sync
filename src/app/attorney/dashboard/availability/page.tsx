"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import styles from "./availability.module.css";
import SideBar from "../../../components/attorneySideBar/AttorneySideBar";
import { CollapsedProvider, useCollapsedContext } from "../../../components/attorneySideBar/attorneySideBarContext";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput, DateSelectArg } from '@fullcalendar/core';
import { EventClickArg } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';


function AvailabilityContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const { user } = useUser();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [availabilityEvents, setAvailabilityEvents] = useState<EventInput[]>([]);
  const [deletingEvent, setDeletingEvent] = useState<EventInput | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch events from DB on page load
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/get-availability");
        const data = await res.json();
        console.log(data)
        if (Array.isArray(data)) {
          const parsed: EventInput[] = [];
          data.forEach((slot) => {
            const start = new Date(`${slot.start}`);
            const end = new Date(`${slot.end}`);
            let current = new Date(start);
            while (current < end) {
              const next = new Date(current.getTime() + 30 * 60000); // 30 min
              parsed.push({
                title: "Available",
                start: new Date(current),
                end: new Date(next),
                allDay: false,
              });
              current = next;
        
          }
        });
        setAvailabilityEvents(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };

    fetchAvailability();
  }, []);

  // Handle time chunk selection in any view
  const handleSelect = (info: DateSelectArg) => {
    const clickedDate = info.startStr.split("T")[0];
    const localStart = info.start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const localEnd = info.end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setStartTime(localStart);
    setEndTime(localEnd);
    setSelectedDate(clickedDate);
  };

  const handleEventClick = (info: EventClickArg) => {
    setDeletingEvent({
      title: info.event.title,
      start: info.event.start!,
      end: info.event.end!,
      allDay: info.event.allDay,
    });
  };
  

  // Add availability to DB and show in calendar
  const handleAddAvailability = async () => {
    if (!selectedDate || !startTime || !endTime || !user) return;

    const payload = {
      attorney_id: user.id,
      attorney_name: user.fullName || "Unknown",
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const res = await fetch("/api/add-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Add to calendar without reload
        const start = new Date(`${selectedDate} ${startTime}`);
        const end = new Date(`${selectedDate} ${endTime}`);

        const newEvents: EventInput[] = [];

        // Split into 30-minute sessions
        let temp = new Date(start);
        while (temp < end) {
          const slotEnd = new Date(temp.getTime() + 30 * 60000);
          newEvents.push({
            title: "Available",
            start: new Date(temp),
            end: new Date(slotEnd),
            allDay: false,
          });
          temp = slotEnd;
        }

        setAvailabilityEvents((prev) => [...prev, ...newEvents]);
      } else {
        console.error("❌ Failed to add availability");
      }
    } catch (err) {
      console.error("⚠️ Error:", err);
    }

    setSelectedDate(null);
    setIsAllDay(false);
  };

  const confirmDelete = async () => {
    if (!deletingEvent || !user) return;
  
    try {
      const res = await fetch("/api/delete-availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attorney_id: user.id,
          start: deletingEvent.start,
          end: deletingEvent.end,
        }),
      });
  
      if (res.ok) {
        setAvailabilityEvents(prev => 
          prev.filter(e =>
            e.start?.toString() !== deletingEvent.start?.toString() ||
            e.end?.toString() !== deletingEvent.end?.toString()
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  
    setDeletingEvent(null);
  };
  

  // Close dropdown if clicked outside
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

  // Generate dropdown 30-minute time chunks
  const timeSlots = Array.from({ length: 36 }, (_, i) => {
    const hour = 6 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  });

  return (
    <div className={styles.availabilityPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Attorney Availability</h1>
          <div className={styles.navButtons}>
            <button onClick={() => router.push("/attorney/dashboard/upcomingAppointments")}>Upcoming Appointments</button>
          </div>
        </div>
        {deletingEvent && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Delete Availability</h3>
              <p>Are you sure you want to delete this time slot?</p>
              <p>
                <strong>
                  {new Date(deletingEvent.start as string).toLocaleTimeString()} -{" "}
                  {new Date(deletingEvent.end as string).toLocaleTimeString()}
                </strong>
              </p>
              <div className={styles.modalButtons}>
                <button onClick={confirmDelete} className={styles.deleteButton}>
                  Yes, Delete
                </button>
                <button onClick={() => setDeletingEvent(null)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        <div className={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={availabilityEvents}
            editable={false}
            selectable={true}
            select={handleSelect}
            allDaySlot={true}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            eventClick={handleEventClick}
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
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isAllDay}>
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
              <span>to</span>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isAllDay}>
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
