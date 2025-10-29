-- Create Availability Table
CREATE TABLE IF NOT EXISTS Availability (
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

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS Appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,            -- Clerk user ID (references Users table)
    student_name TEXT NOT NULL,          -- Cached for performance (can be fetched from Users/Clerk)
    student_email TEXT NOT NULL,         -- Cached for performance (can be fetched from Users/Clerk)
    star_id TEXT NOT NULL,
    tech_id TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slot_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES Availability(id)
);
