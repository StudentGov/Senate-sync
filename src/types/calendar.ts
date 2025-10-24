/**
 * Calendar Event Types
 * TypeScript type definitions for calendar events
 */

import { EventType } from "@/lib/eventTypes";

/**
 * Database Event - matches the Events table structure
 */
export interface DatabaseEvent {
  id: number;
  created_by: string;
  start_time: string;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  is_all_day: boolean | number;
  event_type: EventType;
  color: string | null;
}

/**
 * Calendar Event - formatted for FullCalendar display
 */
export interface CalendarEvent {
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
  extendedProps?: {
    created_by: string;
    description: string;
    location: string;
    is_all_day: boolean;
    event_type: EventType;
  };
}

/**
 * Event Details - for popover/modal display
 */
export interface EventDetails {
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
  eventType?: EventType;
}

/**
 * Create Event Request - for API POST requests
 */
export interface CreateEventRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  is_all_day?: boolean;
  event_type: EventType;
}

/**
 * Update Event Request - for API PUT/PATCH requests
 */
export interface UpdateEventRequest {
  id: number;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_all_day?: boolean;
  event_type?: EventType;
}

