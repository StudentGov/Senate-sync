"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, CalendarApi } from "@fullcalendar/core";
import { useAuth } from "@clerk/nextjs";

import AddEventModal from "@/app/components/add-event-modal";
import { EventDetails, CalendarEvent } from "@/types/calendar";
import "./calendar.css";
import styles from "./calendar-page.module.css";

interface PopoverPosition {
  top: number;
  left: number;
}

export default function CalendarPage() {
  const { sessionClaims } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  
  // Check if user has permission to add events (admin or coordinator)
  const userRole = sessionClaims?.role;
  const canAddEvents = userRole === "admin" || userRole === "coordinator";

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const jsEvent = clickInfo.jsEvent;
    const calendarApi = clickInfo.view.calendar;
    const currentView = calendarApi.view.type;

    console.log("Event clicked:", event.title);
    console.log("Extended props:", event.extendedProps);
    console.log("Location:", event.extendedProps.location);
    
    // Store full event for editing
    const fullEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start?.toISOString() || "",
      end: event.end?.toISOString(),
      allDay: event.allDay,
      extendedProps: event.extendedProps as any,
    };
    setSelectedEventForEdit(fullEvent);
    
    setSelectedEvent({
      title: event.title,
      start: event.allDay
        ? "All day"
        : event.start
        ? event.start.toLocaleString()
        : "",
      end: event.allDay ? "" : event.end ? event.end.toLocaleString() : "",
      description:
        event.extendedProps.description || "No description available",
      location: event.extendedProps.location || "No location specified",
    });

    // Position the popover based on the view
    const rect = (jsEvent.target as HTMLElement).getBoundingClientRect();

    if (currentView === "timeGridWeek") {
      // For weekly view, position to the right of the event
      setPopoverPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 10,
      });
    } else {
      // For monthly view, position below the event
      setPopoverPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
    }

    setIsPopoverOpen(true);
    setShowEventMenu(false);
  };

  const handleEditEvent = () => {
    setIsPopoverOpen(false);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEventForEdit) return;
    
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-event?id=${selectedEventForEdit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully!");
        setIsPopoverOpen(false);
        fetchEvents(); // Refresh events
      } else {
        const error = await response.json();
        alert(`Failed to delete event: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsAddEventModalOpen(false);
    setSelectedEventForEdit(null);
  };

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-events");
      if (response.ok) {
        const data = await response.json();
        console.log("API Response - First Event:", data[0]);
        // Ensure all event IDs are strings
        const formattedEvents = data.map((event: any) => ({
          ...event,
          id: String(event.id),
        }));
        console.log("Formatted Events - First Event:", formattedEvents[0]);
        setEvents(formattedEvents);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  return (
    <main className={styles.pageContainer}>
      <section className={styles.mainSection}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Calendar</h1>
          {canAddEvents && (
            <button 
              onClick={() => setIsAddEventModalOpen(true)}
              className={styles.addEventButton}
            >
              <span className={styles.addEventButtonIcon}>+</span> Add Event
            </button>
          )}
        </div>

        <div className={`${styles.calendarWrapper} full-calendar-wrapper-container`}>
          {loading ? (
            <div className={styles.calendarContainer}>
              <p className={styles.loadingText}>Loading events...</p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "timeGridWeek,dayGridMonth",
              }}
              height="auto"
              selectable={false}
              selectMirror={false}
              dayMaxEvents={false}
              eventClick={handleEventClick}
              eventDisplay="block"
              displayEventTime={true}
              expandRows={true}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:30:00"
              scrollTime="08:00:00"
              allDaySlot={true}
              dayMaxEventRows={2}
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
              events={events}
              eventContent={(eventInfo) => {
                return (
                  <div className="fc-event-main-frame">
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                    <div className="fc-event-title-container">
                      <div className="fc-event-title fc-sticky">
                        {eventInfo.event.title}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </section>

      {/* Event Details Popover */}
      {isPopoverOpen && selectedEvent && (
        <div
          ref={popoverRef}
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
          className={styles.eventPopover}
        >
          <div className={styles.popoverHeader}>
            <h3 className={styles.popoverTitle}>
              {selectedEvent.title}
            </h3>
            <div className={styles.popoverActions}>
              {canAddEvents && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowEventMenu(!showEventMenu)}
                    className={styles.eventMenuButton}
                    aria-label="Event options"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={styles.eventMenuIcon}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  {showEventMenu && (
                    <div className={styles.eventMenuDropdown}>
                      <button
                        onClick={handleEditEvent}
                        className={`${styles.eventMenuDropdownButton} ${styles.eventMenuDropdownButtonEdit}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        className={`${styles.eventMenuDropdownButton} ${styles.eventMenuDropdownButtonDelete}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsPopoverOpen(false)}
                className={styles.popoverCloseButton}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.popoverCloseIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.eventDetails}>
            <div className={styles.eventDetailItem}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.eventDetailIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className={styles.eventDetailContent}>
                <p className={styles.eventDetailText}>{selectedEvent.start}</p>
                {selectedEvent.end && (
                  <p className={styles.eventDetailTextSecondary}>{selectedEvent.end}</p>
                )}
              </div>
            </div>

            {selectedEvent.location && (
              <div className={styles.eventDetailItem}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.eventDetailIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className={styles.eventDetailContent}>
                  <p className={styles.eventDetailTextDescription}>
                    {selectedEvent.location}
                  </p>
                </div>
              </div>
            )}

            {selectedEvent.description && (
              <div className={styles.eventDetailItem}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.eventDetailIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                <div className={styles.eventDetailContent}>
                  <p className={styles.eventDetailTextDescription}>
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={handleCloseModal}
        onEventAdded={fetchEvents}
        editEvent={selectedEventForEdit}
      />
    </main>
  );
}
