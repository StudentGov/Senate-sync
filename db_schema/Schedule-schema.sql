-- Create Availability Table
CREATE TABLE IF NOT EXISTS Availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attorney_id TEXT NOT NULL,         
    attorney_name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by_student_id TEXT,         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS Appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,            
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    star_id TEXT NOT NULL,
    tech_id TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slot_id INTEGER,
    FOREIGN KEY (slot_id) REFERENCES Availability(id)
);
