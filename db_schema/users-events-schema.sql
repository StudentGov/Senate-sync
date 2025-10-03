-- Users table
-- Central user management table with role-based access control
-- Uses Clerk user ID as primary key for consistency with existing tables
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  username VARCHAR(50) UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','senator','coordinator')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
-- Calendar events created by users
CREATE TABLE IF NOT EXISTS Events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by TEXT NOT NULL,  -- Clerk user ID
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  color VARCHAR(9) CHECK (
    color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
    OR color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'
  ),
  FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);

-- Hours table
-- Time tracking for users, optionally linked to events
CREATE TABLE IF NOT EXISTS Hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,  -- Clerk user ID
  event_id INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  comments TEXT,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_created_by ON Events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON Events(start_time);
CREATE INDEX IF NOT EXISTS idx_hours_user_id ON Hours(user_id);
CREATE INDEX IF NOT EXISTS idx_hours_event_id ON Hours(event_id);

