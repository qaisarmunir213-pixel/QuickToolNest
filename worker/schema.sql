CREATE TABLE IF NOT EXISTS site_data (
  section TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT OR IGNORE INTO site_data(section,value,updated_at) VALUES
('tools','[]',datetime('now')),
('pages','[]',datetime('now')),
('ads','{"enabled":false,"clientId":"","slots":[]}',datetime('now')),
('settings','{"siteName":"QuickToolNest","contactEmail":""}',datetime('now'));
