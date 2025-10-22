# Calendar Setup Guide

This document explains how to set up and use the calendar feature with database integration.

## Setup

### 1. Seed Sample Events

To populate the database with sample events for testing:

```bash
node src/app/db-test-script/seed-events.js
```

This will create 10 sample events for the current month with various colors and times.

## API Endpoints

### GET /api/get-events

Fetches all events from the database.

**Optional Query Parameters:**
- `start`: Start date filter (ISO format)
- `end`: End date filter (ISO format)

**Response:**
```json
[
  {
    "id": "1",
    "title": "1",
    "description": "Event description",
    "start": "2025-10-01T09:00:00.000Z",
    "end": "2025-10-01T17:00:00.000Z",
    "backgroundColor": "#93c5fd",
    "borderColor": "#676767",
    "textColor": "#1E40AF"
  }
]
```

**Note**: The API automatically:
- Returns timestamps in ISO format
- Darkens colors for borders
- Includes event creator info in extendedProps

### POST /api/add-event

Creates a new event in the database. Requires authentication (Clerk userId).

**Required Fields:**
- `title`: string (max 255 characters)
- `start_time`: ISO datetime string (e.g., "2025-10-15T14:00:00")
- `event_type`: one of the following event types:
  - `senate_meeting` - Senate Meeting (Purple)
  - `committee_meeting` - Committee Meeting (Blue)
  - `office_hours` - Office Hours (Green)
  - `administrative_meeting` - Administrative Meeting (Orange)
  - `misc` - Misc. (Yellow)

**Optional Fields:**
- `description`: string (text)
- `end_time`: ISO datetime string
- `location`: string (max 255 characters)
- `is_all_day`: boolean (default: false)

**Example Request:**
```json
{
  "title": "Senate Meeting - Fall Session",
  "description": "Monthly senate meeting to discuss campus policies",
  "start_time": "2025-10-15T14:00:00",
  "end_time": "2025-10-15T16:00:00",
  "location": "Student Center Room 201",
  "event_type": "senate_meeting",
  "is_all_day": false
}
```

**Notes:**
- Uses authenticated Clerk user ID directly (no mapping needed)
- Requires Clerk authentication via `auth()` middleware
- Title must be a string (VARCHAR 255 max length)
- Event type determines the color automatically (see `src/lib/eventTypes.ts`)
- Timestamps should be in ISO 8601 format

## Calendar Features

### Current Features

1. **Month and Week Views** - Toggle between month and week calendar views
2. **Colored Events** - Each event can have custom colors
3. **Event Details Popover** - Click on events to see a detailed popover with:
   - Event title
   - Start and end times
   - Location
   - Description
4. **Fixed Height** - Calendar maintains a consistent height in both month and week views (700px)
5. **Loading State** - Shows loading indicator while fetching events
6. **Database Integration** - Events are fetched from your Turso database

### Styling

The calendar uses custom CSS defined in `src/app/calendar/calendar.css`:
- Modern, clean design matching your reference image
- Colored event blocks with hover effects
- Responsive design for mobile devices
- Custom scrollbar styling

## Adding Events Manually

You can add events directly to the database using the `/api/add-event` endpoint:

```javascript
const response = await fetch("/api/add-event", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Senate Meeting - Fall Session",
    description: "Monthly senate meeting to discuss campus policies",
    start_time: "2025-10-20T10:00:00",
    end_time: "2025-10-20T11:00:00",
    location: "Student Center Room 201",
    event_type: "senate_meeting",
    is_all_day: false,
  }),
});
```

Or directly in the database:

```sql
INSERT INTO Events (created_by, start_time, end_time, title, description, location, event_type, is_all_day)
VALUES (
  'user_clerk_id',                 -- Clerk User ID
  '2025-10-20 10:00:00',          -- ISO timestamp for start
  '2025-10-20 11:00:00',          -- ISO timestamp for end
  'Senate Meeting - Fall Session', -- Event title
  'Monthly senate meeting',        -- Description
  'Student Center Room 201',       -- Location
  'senate_meeting',                -- Event type
  0                                -- is_all_day (0 = false, 1 = true)
);
```

## Event Types and Colors

The system uses predefined event types that automatically determine colors:

- **Senate Meeting** (`senate_meeting`): Purple (`#9D45FC` / `#7D37CA` / `#4A1B73`)
- **Committee Meeting** (`committee_meeting`): Green (`#34C237` / `#28A02D` / `#1A5F1E`)
- **Office Hours** (`office_hours`): Yellow (`#FFBF00` / `#CC9900` / `#805F00`)
- **Administrative Meeting** (`administrative_meeting`): Red (`#FF3A3A` / `#CC2E2E` / `#8C1F1F`)
- **Misc.** (`misc`): Blue (`#2E82E8` / `#2468BA` / `#1A4A8C`)

Colors are stored in `src/lib/eventTypes.ts` and can be updated centrally for all events of that type.

## Troubleshooting

### Events not showing up?
1. Make sure the Events table exists in your database
2. Run the seed script to add sample events
3. Check the browser console for any API errors
4. Verify your database connection in `.env` file

### Week view extending too far?
The calendar now has a fixed height of 700px to prevent this issue.

### Custom height needed?
You can adjust the height in `src/app/calendar/page.tsx`:
```tsx
height="700px"
contentHeight="650px"
```

## Next Steps

To make the "Add Event" button functional, you would need to:
1. Create a form modal/dialog
2. Collect event details from the user
3. Call the `/api/add-event` endpoint
4. Refresh the calendar to show the new event

