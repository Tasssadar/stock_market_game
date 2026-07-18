import path from 'path'
import Database from 'better-sqlite3'

let gameDbInstance: Database.Database | null = null

export function getGameDb(): Database.Database {
  if (!gameDbInstance) {
    const dbPath = path.resolve(process.cwd(), 'game.db')
    gameDbInstance = new Database(dbPath)
    gameDbInstance.pragma('journal_mode = WAL')
    gameDbInstance.pragma('foreign_keys = ON')
  }
  return gameDbInstance
}

export function initGameDb(): void {
  const db = getGameDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      turn_length_days INTEGER NOT NULL,
      current_turn INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'setup',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      pin TEXT NOT NULL,
      starting_money REAL NOT NULL,
      cash REAL NOT NULL,
      FOREIGN KEY (round_id) REFERENCES rounds(id),
      UNIQUE(round_id, name)
    );

    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      shares INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id, ticker)
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      turn INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      action TEXT NOT NULL,
      shares INTEGER NOT NULL,
      price_per_share REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `)
}
