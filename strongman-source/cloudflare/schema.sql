CREATE TABLE IF NOT EXISTS sm_head (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL,
  snapshot TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sm_snapshots (
  snapshot TEXT NOT NULL,
  part INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (snapshot, part)
);
