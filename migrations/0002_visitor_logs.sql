CREATE TABLE IF NOT EXISTS visitor_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  city TEXT,
  region TEXT,
  continent TEXT,
  timezone TEXT,
  ip TEXT,
  method TEXT,
  url TEXT,
  path TEXT,
  user_agent TEXT,
  referer TEXT
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at
  ON visitor_logs (created_at DESC);
