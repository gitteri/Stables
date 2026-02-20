import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "stablecoins.db");

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stablecoin_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      mint_address TEXT NOT NULL,
      mint_name TEXT NOT NULL,
      holders INTEGER NOT NULL DEFAULT 0,
      volume REAL NOT NULL DEFAULT 0,
      p2p_volume REAL,
      transactions INTEGER NOT NULL DEFAULT 0,
      supply REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, mint_address)
    );

    CREATE INDEX IF NOT EXISTS idx_date ON stablecoin_data(date);
    CREATE INDEX IF NOT EXISTS idx_mint ON stablecoin_data(mint_address);
    CREATE INDEX IF NOT EXISTS idx_mint_name ON stablecoin_data(mint_name);

    CREATE TABLE IF NOT EXISTS data_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
      records_updated INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success'
    );

    -- Add supply column if it doesn't exist (for existing databases)
    ALTER TABLE stablecoin_data ADD COLUMN supply REAL DEFAULT 0;
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export interface StablecoinRow {
  date: string;
  mint_address: string;
  mint_name: string;
  holders: number;
  volume: number;
  p2p_volume: number | null;
  transactions: number;
  supply?: number;
}

export function insertStablecoinData(rows: StablecoinRow[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO stablecoin_data
    (date, mint_address, mint_name, holders, volume, p2p_volume, transactions, supply)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: StablecoinRow[]) => {
    for (const row of rows) {
      insert.run(
        row.date,
        row.mint_address,
        row.mint_name,
        row.holders,
        row.volume,
        row.p2p_volume,
        row.transactions,
        row.supply || 0
      );
    }
  });

  insertMany(rows);

  // Log update
  db.prepare(`
    INSERT INTO data_updates (records_updated) VALUES (?)
  `).run(rows.length);
}

export function getAllStablecoinData(): StablecoinRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      date,
      mint_address,
      mint_name,
      holders,
      volume,
      p2p_volume,
      transactions,
      supply
    FROM stablecoin_data
    ORDER BY date ASC, mint_name ASC
  `).all() as StablecoinRow[];
}

export function getLastUpdateTime(): Date | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT last_update FROM data_updates
    ORDER BY id DESC LIMIT 1
  `).get() as { last_update: string } | undefined;

  return result ? new Date(result.last_update) : null;
}
