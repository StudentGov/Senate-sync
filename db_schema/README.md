# Database Schema

This directory contains the SQL schema definitions for the application's database.

## Tables

### Users
Stores user account information with role-based access control.

```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','senator','coordinator')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `admin` - Full system access
- `senator` - Senate member access
- `coordinator` - Coordination privileges

---

### Events
Stores calendar events created by users.

```sql
CREATE TABLE Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  color VARCHAR(9) CHECK (
    color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
    OR color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
  ),
  FOREIGN KEY (created_by) REFERENCES Users(id)
);
```

**Fields:**
- `location` - Optional event location (venue name, address, or "Online/Virtual")

**Color Format:**
- Must be a hex color string
- Supports 6-digit format: `#93C5FD`
- Supports 8-digit format (with alpha): `#93C5FD80`

---

### Hours
Tracks time/hours logged by users, optionally linked to events.

```sql
CREATE TABLE Hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  comments TEXT,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
```

**Note:** `event_id` is optional, allowing hours to be logged independently or linked to specific events.

---

### Availability

Stores attorney availability time slots for appointment scheduling.

```sql
CREATE TABLE Availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attorney_id TEXT NOT NULL,         -- Clerk user ID (references Users table)
  attorney_name TEXT NOT NULL,       -- Cached for performance (can be fetched from Users/Clerk)
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by_student_id TEXT,         -- Clerk user ID (references Users table)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attorney_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by_student_id) REFERENCES Users(id) ON DELETE SET NULL
);
```

**Fields:**

- `attorney_id` - Clerk user ID of the attorney offering the time slot
- `attorney_name` - Cached attorney name for performance optimization
- `date` - Date of the availability slot
- `start_time` - Start time of the availability slot
- `end_time` - End time of the availability slot
- `is_booked` - Boolean flag indicating if the slot has been booked
- `booked_by_student_id` - Clerk user ID of the student who booked the slot (NULL if not booked)
- `created_at` - Timestamp when the availability slot was created

**Foreign Keys:**

- `attorney_id` → `Users(id)` ON DELETE CASCADE (removes availability when attorney is deleted)
- `booked_by_student_id` → `Users(id)` ON DELETE SET NULL (preserves booking if student is deleted)

---

### Appointments

Stores booked appointments between students and attorneys.

```sql
CREATE TABLE Appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,            -- Clerk user ID (references Users table)
  student_name TEXT NOT NULL,          -- Cached for performance (can be fetched from Users/
## Relationships

```
Users (1) ─────< (many) Events
  └─── created_by

Users (1) ─────< (many) Hours
  └─── user_id
```

## Schema Files

- `users-events-schema.sql` - User management (with Clerk integration), calendar events, and hours tracking
- `Schedule-schema.sql` - Attorney appointment scheduling tables (with foreign keys to Users)
- `voting-schema.sql` - Senate voting system tables (with foreign keys to Users)
- `migration-add-user-fks.sql` - Migration script for existing databases
- `migration-add-location.sql` - Migration to add location column to Events table
- `MIGRATION_GUIDE.md` - Step-by-step migration instructions

## Seed Scripts

- `../scripts/seed-october-events.js` - JavaScript script to populate 10 sample events for October 2025 (includes locations and all-day events)

## Architecture Notes

### User ID Strategy

✅ **Implemented: Clerk-Database Integration**

All tables now use Clerk user IDs (TEXT) with foreign key constraints to the Users table:

**Users Table (Central):**
- `Users.id TEXT PRIMARY KEY` - Clerk user ID
- `Users.username VARCHAR(50)` - Extracted from email
- `Users.role TEXT` - Source of truth for user roles

**Foreign Key References:**
- ✅ `Events.created_by` → `Users(id)` ON DELETE CASCADE
- ✅ `Hours.user_id` → `Users(id)` ON DELETE CASCADE
- ✅ `Agendas.speaker_id` → `Users(id)` ON DELETE CASCADE
- ✅ `Votes.voter_id` → `Users(id)` ON DELETE CASCADE
- ✅ `Availability.attorney_id` → `Users(id)` ON DELETE CASCADE
- ✅ `Availability.booked_by_student_id` → `Users(id)` ON DELETE SET NULL
- ✅ `Appointments.student_id` → `Users(id)` ON DELETE CASCADE

**Benefits:**
- ✅ Referential integrity enforced at database level
- ✅ Automatic cascade deletes for data consistency
- ✅ Database as source of truth for roles
- ✅ Reduced Clerk API calls for better performance
- ✅ Users auto-synced on login

**Implementation Details:**
See `CLERK_DATABASE_INTEGRATION.md` and `MIGRATION_GUIDE.md` for complete documentation.

## Notes

- All timestamps use SQLite's TIMESTAMP type (ISO 8601 format)
- Foreign keys enforce referential integrity
- CHECK constraints validate data at the database level
- Default timestamps automatically track record creation/updates
- `ON DELETE CASCADE` ensures related records are cleaned up
- `ON DELETE SET NULL` preserves hours when events are deleted

