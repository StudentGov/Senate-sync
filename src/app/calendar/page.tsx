"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

import StudentGovernmentFooter from "@/app/components/footer";
import "./calendar.css";

interface EventDetails {
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
}

interface PopoverPosition {
  top: number;
  left: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export default function CalendarPage() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const jsEvent = clickInfo.jsEvent;
    
    setSelectedEvent({
      title: event.title,
      start: event.allDay ? "All day" : (event.start ? event.start.toLocaleString() : ""),
      end: event.allDay ? "" : (event.end ? event.end.toLocaleString() : ""),
      description: event.extendedProps.description || "No description available",
      location: event.extendedProps.location || "No location specified",
    });

    // Position the popover near the clicked event
    const rect = (jsEvent.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
    
    setIsPopoverOpen(true);
  };

  // Fetch events from the database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-events");
        if (response.ok) {
          const data = await response.json();
          // Ensure all event IDs are strings
          const formattedEvents = data.map((event: any) => ({
            ...event,
            id: String(event.id),
          }));
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

    fetchEvents();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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
    <main className="w-full min-h-screen flex flex-col">
      <section className="flex-1 mx-auto w-full max-w-[95rem] px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <button className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors flex items-center gap-2">
            <span className="text-lg">+</span> Add Event
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 calendar-container">
          {loading ? (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              height="auto"
              selectable={true}
              selectMirror={true}
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
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
                hour12: true
              }}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
                hour12: true
              }}
              events={events}
              eventContent={(eventInfo) => {
                return (
                  <div className="fc-event-main-frame">
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                    <div className="fc-event-title-container">
                      <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
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
            position: "absolute",
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
            zIndex: 1000,
          }}
          className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 pr-2">
              {selectedEvent.title}
            </h3>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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

          <div className="space-y-3">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <p className="text-sm text-gray-900">{selectedEvent.start}</p>
                {selectedEvent.end && (
                  <p className="text-sm text-gray-600">{selectedEvent.end}</p>
                )}
              </div>
            </div>

            {selectedEvent.location && (
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5"
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
                <p className="text-sm text-gray-700">{selectedEvent.location}</p>
              </div>
            )}

            {selectedEvent.description && (
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5"
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
                <p className="text-sm text-gray-700">{selectedEvent.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <StudentGovernmentFooter />
    </main>
  );
}