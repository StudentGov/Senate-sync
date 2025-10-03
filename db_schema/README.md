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
  color VARCHAR(9) CHECK (
    color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
    OR color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
  ),
  FOREIGN KEY (created_by) REFERENCES Users(id)
);
```

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

## Relationships

```
Users (1) ─────< (many) Events
  └─── created_by

Users (1) ─────< (many) Hours
  └─── user_id
```

## Schema Files

- `users-events-schema.sql` - User management, calendar events, and hours tracking (NEW)
- `Schedule-schema.sql` - Attorney appointment scheduling tables
- `voting-schema.sql` - Senate voting system tables

## Architecture Notes

### User ID Strategy

✅ **Consistent approach across all tables:**

All tables use Clerk user IDs (TEXT) for user references:
- **New Tables**: `Users.id TEXT PRIMARY KEY`, `Events.created_by TEXT`, `Hours.user_id TEXT`
- **Existing Tables**: `attorney_id TEXT`, `voter_id VARCHAR(255)`, `student_id TEXT`

**Benefits:**
- No mapping needed between systems
- Direct foreign key relationships
- Consistent with existing architecture
- Simple to understand and maintain

**Future Migration (Optional):**
To eliminate redundant name storage in existing tables:
1. Add Users table entries for all Clerk users
2. Update existing tables to use foreign keys to Users table
3. Remove redundant `*_name` columns (attorney_name, voter_name, etc.)
4. Query user details from Users table instead

## Notes

- All timestamps use SQLite's TIMESTAMP type (ISO 8601 format)
- Foreign keys enforce referential integrity
- CHECK constraints validate data at the database level
- Default timestamps automatically track record creation/updates
- `ON DELETE CASCADE` ensures related records are cleaned up
- `ON DELETE SET NULL` preserves hours when events are deleted

