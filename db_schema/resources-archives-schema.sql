-- Resources Table
-- Stores links to helpful resources with metadata
CREATE TABLE IF NOT EXISTS Resources (
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

-- Archives Table
-- Stores historical documents and records
CREATE TABLE IF NOT EXISTS Archives (
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

