-- Users table
-- Central user management table with role-based access control
-- Uses Clerk user ID as primary key for consistency with existing tables
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,                    -- Clerk user ID (primary key)
  username VARCHAR(50) UNIQUE NOT NULL,   -- Username extracted from email
  role TEXT NOT NULL CHECK (role IN ('admin','senator','coordinator','attorney')), -- User role for access control
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when user was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when user was last updated
);

-- Events table
-- Calendar events created by users
-- Colors are determined by event_type (see src/lib/eventTypes.ts)
CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by TEXT NOT NULL,  -- Clerk user ID
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  is_all_day BOOLEAN DEFAULT FALSE,
  event_type TEXT NOT NULL DEFAULT 'misc' CHECK (
    event_type IN (
      'senate_meeting',
      'committee_meeting',
      'office_hours',
      'administrator',
      'misc'
    )
  ),
  FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);

-- Hours table
-- Time tracking for users
CREATE TABLE IF NOT EXISTS Hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,  -- Clerk user ID
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  activity TEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON Events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON Events(start_time);
CREATE INDEX IF NOT EXISTS idx_hours_user_id ON Hours(user_id);

