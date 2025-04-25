-- Agendas table
CREATE TABLE IF NOT EXISTS Agendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    speaker_id VARCHAR(255) NOT NULL,  
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT FALSE,  
    is_open BOOLEAN DEFAULT TRUE,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options table
CREATE TABLE IF NOT EXISTS Options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agenda_id INTEGER NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    vote_count INTEGER DEFAULT 0,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agenda_id) REFERENCES Agendas(id) ON DELETE CASCADE
);

-- Votes table
CREATE TABLE IF NOT EXISTS Votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voter_id VARCHAR(255) NOT NULL,     
    voter_name TEXT NOT NULL,          
    agenda_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agenda_id) REFERENCES Agendas(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Options(id) ON DELETE CASCADE,
    UNIQUE (voter_id, agenda_id) 
);

