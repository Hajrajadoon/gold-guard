import Database from "better-sqlite3";

// Single-file SQLite store for verification records.
const db = new Database("goldguard.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    asset TEXT CHECK(asset IN ('gold','silver')),

    weight REAL,

    purity REAL,

    score INTEGER,

    risk TEXT,

    tx_hash TEXT,

    date TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
