"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

import StudentGovernmentFooter from "@/app/components/footer";

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

export default function CalendarPage() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const jsEvent = clickInfo.jsEvent;
    
    setSelectedEvent({
      title: event.title,
      start: event.start ? event.start.toLocaleString() : "",
      end: event.end ? event.end.toLocaleString() : "",
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
    <main className="w-full">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
        <div className="bg-white rounded-md shadow p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventClick={handleEventClick}
            events={[
              // sample events; replace with your data or API
              {
                title: "Student Government Meeting",
                start: new Date().toISOString().slice(0, 10) + "T14:00:00",
                end: new Date().toISOString().slice(0, 10) + "T16:00:00",
                description: "Monthly student government meeting to discuss campus initiatives.",
                location: "Centennial Student Union, Room 280",
              },
              {
                title: "Campus Event",
                start: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10) + "T18:00:00",
                end: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10) + "T20:00:00",
                description: "Annual campus social event for all students.",
                location: "Main Quad",
              },
            ]}
            dateClick={(info) => {
              // handle day clicks if needed
              // console.log("dateClick", info.dateStr);
            }}
            select={(info) => {
              // handle drag-select if needed
              // console.log("select", info.startStr, info.endStr);
            }}
          />
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