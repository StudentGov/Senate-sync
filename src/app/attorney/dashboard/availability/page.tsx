"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import styles from "./availability.module.css";
import calendarStyles from "../../../calendar/calendar-page.module.css"; // Import global calendar styles

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventInput, DateSelectArg, DateInput } from '@fullcalendar/core';
import { EventClickArg } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';


function AvailabilityContent() {
  const { user } = useUser();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [availabilityEvents, setAvailabilityEvents] = useState<EventInput[]>([]);
  const [deletingEvent, setDeletingEvent] = useState<EventInput | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to convert DateInput to Date
  const toDate = (dateInput: DateInput | null | undefined): Date | null => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'string') return new Date(dateInput);
    if (typeof dateInput === 'number') return new Date(dateInput);
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
      // FullCalendar date array format: [year, month, day, hour?, minute?, second?]
      // Note: month is 0-indexed in JavaScript Date but 1-indexed in FullCalendar arrays
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return null;
  };

  // Helper function to parse and set availability events
  const parseAvailabilityEvents = (data: any[]) => {
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
    return parsed;
  };

  // Helper function to refresh availability from server
  const refreshAvailability = async () => {
    try {
      const res = await fetch("/api/get-availability");
      const data = await res.json();
      if (Array.isArray(data)) {
        const parsed = parseAvailabilityEvents(data);
        setAvailabilityEvents(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    }
  };

  // Fetch events from DB on page load
  useEffect(() => {
    refreshAvailability();
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
    if (selectionMode) {
      // Toggle selection
      const startDate = toDate(info.event.start);
      const endDate = toDate(info.event.end);
      const slotKey = startDate && endDate ? `${startDate.toISOString()}-${endDate.toISOString()}` : '';
      if (slotKey) {
        setSelectedSlots((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(slotKey)) {
            newSet.delete(slotKey);
          } else {
            newSet.add(slotKey);
          }
          return newSet;
        });
      }
    } else {
      // Single delete mode
      setDeletingEvent({
        title: info.event.title,
        start: info.event.start!,
        end: info.event.end!,
        allDay: info.event.allDay,
      });
    }
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
        // Refresh from server to ensure consistency
        await refreshAvailability();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  
    setDeletingEvent(null);
  };

  const handleBulkDelete = async () => {
    if (selectedSlots.size === 0 || !user) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedSlots.size} time slot(s)? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Convert selected slot keys back to event objects
      const slotsToDelete = availabilityEvents
        .filter((event) => {
          const startDate = toDate(event.start);
          const endDate = toDate(event.end);
          const slotKey = startDate && endDate ? `${startDate.toISOString()}-${endDate.toISOString()}` : '';
          return slotKey && selectedSlots.has(slotKey);
        })
        .map((event) => {
          const startDate = toDate(event.start);
          const endDate = toDate(event.end);
          return {
            start: startDate?.toISOString() || '',
            end: endDate?.toISOString() || '',
          };
        });

      const res = await fetch("/api/bulk-delete-availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: slotsToDelete,
        }),
      });

      if (res.ok) {
        // Refresh from server
        await refreshAvailability();
        setSelectedSlots(new Set());
        setSelectionMode(false);
        alert(`Successfully deleted ${slotsToDelete.length} time slot(s)!`);
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      alert("An error occurred while deleting slots.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Clear selections when exiting selection mode
      setSelectedSlots(new Set());
    }
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

  // Generate dropdown 30-minute time chunks (7 AM to 5 PM)
  // 7 AM to 5 PM = 10 hours = 20 slots (30 minutes each)
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  });

  return (
    <div className={styles.availabilityPage}>
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Attorney Availability</h1>
          <div className={styles.navButtons}>
            <button
              onClick={toggleSelectionMode}
              className={selectionMode ? styles.activeButton : styles.selectButton}
            >
              {selectionMode ? "Cancel Selection" : "Select Multiple"}
            </button>
            {selectionMode && selectedSlots.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className={styles.deleteButton}
              >
                {isDeleting ? "Deleting..." : `Delete ${selectedSlots.size} Selected`}
              </button>
            )}
            <button onClick={() => router.push("/attorney/dashboard/upcomingAppointments")}>
              Upcoming Appointments
            </button>
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


        <div className={`${styles.calendarWrapper} full-calendar-wrapper-container`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={availabilityEvents.map((event) => {
              const startDate = toDate(event.start);
              const endDate = toDate(event.end);
              const slotKey = startDate && endDate ? `${startDate.toISOString()}-${endDate.toISOString()}` : '';
              const isSelected = slotKey ? selectedSlots.has(slotKey) : false;
              return {
                ...event,
                backgroundColor: selectionMode
                  ? isSelected
                    ? "#dc2626"
                    : "#3b82f6"
                  : undefined,
                borderColor: selectionMode
                  ? isSelected
                    ? "#dc2626"
                    : "#3b82f6"
                  : undefined,
                classNames: selectionMode && isSelected ? ["selected-slot"] : [],
              };
            })}
            editable={false}
            selectable={!selectionMode}
            select={selectionMode ? undefined : handleSelect}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="17:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            scrollTime="08:00:00"
            hiddenDays={[0, 6]}
            height="auto"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "timeGridWeek,dayGridMonth",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            eventClick={handleEventClick}
            eventDisplay="block"
            displayEventTime={true}
            expandRows={true}
            nowIndicator={true}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
          />
        </div>
        {selectionMode && (
          <div className={styles.selectionInfo}>
            <p>
              {selectedSlots.size > 0
                ? `${selectedSlots.size} slot(s) selected. Click on slots to select/deselect.`
                : "Selection mode active. Click on time slots to select them for deletion."}
            </p>
          </div>
        )}

        {selectedDate && (
          <div ref={dropdownRef} className={styles.dropdownContainer}>
            <h4>Select availability for {selectedDate}</h4>
            <div className={styles.timeRow}>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
              <span>to</span>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
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
  return <AvailabilityContent />;
}
