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

### Resources
Stores links to helpful resources with metadata.

```sql
CREATE TABLE Resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);
```

**Fields:**
- `link` - URL to the resource (required)
- `image_url` - Optional image/thumbnail URL

---

### Archives
Stores historical documents and records.

```sql
CREATE TABLE Archives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link TEXT NOT NULL,
  image_url TEXT,
  archive_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);
```

**Fields:**
- `link` - URL to the archived document (required)
- `image_url` - Optional image/thumbnail URL
- `archive_type` - Category (video, meeting_minutes, document, misc)

---

## Relationships

```
Users (1) ─────< (many) Events
  └─── created_by

Users (1) ─────< (many) Hours
  └─── user_id

Users (1) ─────< (many) Resources
  └─── created_by

Users (1) ─────< (many) Archives
  └─── created_by
```

## Schema Files

- `users-events-schema.sql` - User management (with Clerk integration), calendar events, and hours tracking
- `Schedule-schema.sql` - Attorney appointment scheduling tables (with foreign keys to Users)
- `voting-schema.sql` - Senate voting system tables (with foreign keys to Users)
- `resources-archives-schema.sql` - Resources and archives management tables (with foreign keys to Users)
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
- ✅ `Resources.created_by` → `Users(id)` ON DELETE CASCADE
- ✅ `Archives.created_by` → `Users(id)` ON DELETE CASCADE
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
