-- Agendas table
CREATE TABLE IF NOT EXISTS Agendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    speaker_id TEXT NOT NULL,         -- Clerk user ID (references Users table)
    title VARCHAR(255) NOT NULL,      -- Title of the agenda item
    description TEXT NOT NULL,      
    is_visible BOOLEAN DEFAULT FALSE, -- Whether the agenda is visible to voters
    is_open BOOLEAN DEFAULT TRUE,     -- Whether voting is currently open for this agenda
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (speaker_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Options table
CREATE TABLE IF NOT EXISTS Options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agenda_id INTEGER NOT NULL,       -- Reference to the parent agenda item
    option_text VARCHAR(255) NOT NULL,
    vote_count INTEGER DEFAULT 0,     -- Number of votes cast for this option
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agenda_id) REFERENCES Agendas(id) ON DELETE CASCADE
);

-- Votes table
CREATE TABLE IF NOT EXISTS Votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voter_id TEXT NOT NULL,           -- Clerk user ID (references Users table)
    voter_name TEXT NOT NULL,         -- Cached for performance (can be fetched from Users/Clerk)
    agenda_id INTEGER NOT NULL,       -- Reference to the agenda being voted on
    option_id INTEGER NOT NULL,       -- Reference to the option chosen by the voter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (agenda_id) REFERENCES Agendas(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Options(id) ON DELETE CASCADE,
    UNIQUE (voter_id, agenda_id)      -- Ensures each voter can only vote once per agenda
);

