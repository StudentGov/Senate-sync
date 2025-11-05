/**
 * Event Type Configuration
 * Defines the available event types and their associated colors
 */

export type EventType = 
  | "senate_meeting"
  | "committee_meeting" 
  | "office_hours"
  | "administrator"
  | "misc";

export interface EventTypeConfig {
  label: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export const EVENT_TYPE_CONFIG: Record<EventType, EventTypeConfig> = {
  senate_meeting: {
    label: "Senate Meeting",
    backgroundColor: "#C084FC", // Light Purple
    borderColor: "#9D45FC",      // Medium purple
    textColor: "#000000",        // Black text
  },
  committee_meeting: {
    label: "Committee Meeting",
    backgroundColor: "#6EE07E", // Light Green
    borderColor: "#34C237",      // Medium green
    textColor: "#000000",        // Black text
  },
  office_hours: {
    label: "Office Hours",
    backgroundColor: "#FFD84D", // Light Yellow
    borderColor: "#FFBF00",      // Medium yellow/gold
    textColor: "#000000",        // Black text
  },
  administrator: {
    label: "Administrator",
    backgroundColor: "#FF6B6B", // Light Red
    borderColor: "#FF3A3A",      // Medium red
    textColor: "#000000",        // Black text
  },
  misc: {
    label: "Misc.",
    backgroundColor: "#73ADFF", // Light Blue
    borderColor: "#2E82E8",      // Medium blue
    textColor: "#000000",        // Black text
  },
};

/**
 * Get event type configuration by type
 */
export function getEventTypeConfig(eventType: EventType): EventTypeConfig {
  return EVENT_TYPE_CONFIG[eventType];
}

/**
 * Get all event types as an array for dropdowns/selects
 */
export function getAllEventTypes(): Array<{ value: EventType; label: string }> {
  return Object.entries(EVENT_TYPE_CONFIG).map(([value, config]) => ({
    value: value as EventType,
    label: config.label,
  }));
}

/**
 * Validate if a string is a valid event type
 */
export function isValidEventType(value: string): value is EventType {
  return value in EVENT_TYPE_CONFIG;
}

