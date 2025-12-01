"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useUser } from "@clerk/nextjs";

import AddEventModal from "@/app/components/add-event-modal";
import { EventDetails, CalendarEvent } from "@/types/calendar";
import { EventType } from "@/lib/eventTypes";
import "./calendar.css";

interface PopoverPosition {
  top: number;
  left: number;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] =
    useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Check if user has permission to add events (admin or coordinator)
  const canAddEvents =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "coordinator";

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const jsEvent = clickInfo.jsEvent;
    const calendarApi = clickInfo.view.calendar;
    const currentView = calendarApi.view.type;

    console.log("Event clicked:", event.title);
    console.log("Extended props:", event.extendedProps);
    console.log("Location:", event.extendedProps.location);

    // Store full event for editing
    const extendedProps = event.extendedProps as Record<string, unknown>;
    const fullEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start?.toISOString() || "",
      end: event.end?.toISOString(),
      allDay: event.allDay,
      extendedProps: {
        created_by: String(extendedProps.created_by || ""),
        description: String(extendedProps.description || ""),
        location: String(extendedProps.location || ""),
        is_all_day: Boolean(extendedProps.is_all_day ?? false),
        event_type:
          (extendedProps.event_type as EventType) || ("misc" as EventType),
      },
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
      const response = await fetch(
        `/api/delete-event?id=${selectedEventForEdit.id}`,
        {
          method: "DELETE",
        }
      );

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
        const formattedEvents = data.map((event: CalendarEvent) => ({
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
    <main className="w-full min-h-screen flex flex-col">
      <section className="flex-1 mx-auto w-full max-w-[95rem] px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          {canAddEvents && (
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add Event
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 full-calendar-wrapper-container">
          {loading ? (
            <div
              className="flex justify-center items-center"
              style={{ minHeight: "60vh" }}
            >
              <p className="text-gray-500">Loading events...</p>
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
            <div className="flex items-center gap-1">
              {canAddEvents && (
                <div className="relative">
                  <button
                    onClick={() => setShowEventMenu(!showEventMenu)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    aria-label="Event options"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  {showEventMenu && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={handleEditEvent}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                <p className="text-sm text-gray-700">
                  {selectedEvent.location}
                </p>
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
                <p className="text-sm text-gray-700">
                  {selectedEvent.description}
                </p>
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
