-- Research desk schema. Check-ins and theses are append-only by design: the API has no update or delete for them.
CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Unchanged','Stronger','Weaker','Invalidated','Started')),
  note TEXT NOT NULL
);

CREATE TABLE exy_cot (
  report_date TEXT PRIMARY KEY,
  long_pos INTEGER NOT NULL CHECK (long_pos >= 0),
  short_pos INTEGER NOT NULL CHECK (short_pos >= 0),
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE cot_snapshots (
  market TEXT NOT NULL,
  report_date TEXT NOT NULL,
  lev_long INTEGER NOT NULL,
  lev_short INTEGER NOT NULL,
  am_long INTEGER NOT NULL,
  am_short INTEGER NOT NULL,
  open_interest INTEGER,
  source TEXT NOT NULL DEFAULT 'cftc',
  PRIMARY KEY (market, report_date)
);

CREATE TABLE theses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version INTEGER NOT NULL UNIQUE,
  asset TEXT NOT NULL,
  title TEXT NOT NULL,
  bias TEXT NOT NULL CHECK (bias IN ('Up','Down','Neutral')),
  window_min INTEGER NOT NULL,
  window_max INTEGER NOT NULL,
  invalidation TEXT,
  started_on TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job TEXT NOT NULL,
  ok INTEGER NOT NULL,
  detail TEXT,
  at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
