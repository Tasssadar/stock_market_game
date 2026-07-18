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

function getColumnType(db: Database.Database, table: string, column: string): string | null {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string; type: string }>
  return columns.find(col => col.name === column)?.type?.toUpperCase() ?? null
}

function migrateIntegerSharesToReal(db: Database.Database, table: 'holdings' | 'trades'): void {
  const sharesType = getColumnType(db, table, 'shares')
  if (!sharesType || sharesType.includes('REAL')) {
    return
  }

  if (table === 'holdings') {
    db.exec(`
      CREATE TABLE holdings_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        ticker TEXT NOT NULL,
        shares REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, ticker)
      );

      INSERT INTO holdings_new (id, player_id, ticker, shares)
      SELECT id, player_id, ticker, CAST(shares AS REAL) FROM holdings;

      DROP TABLE holdings;
      ALTER TABLE holdings_new RENAME TO holdings;
    `)
    return
  }

  db.exec(`
    CREATE TABLE trades_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      turn INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      action TEXT NOT NULL,
      shares REAL NOT NULL,
      price_per_share REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    INSERT INTO trades_new (id, player_id, turn, ticker, action, shares, price_per_share, total, created_at)
    SELECT id, player_id, turn, ticker, action, CAST(shares AS REAL), price_per_share, total, created_at FROM trades;

    DROP TABLE trades;
    ALTER TABLE trades_new RENAME TO trades;
  `)
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
      starting_money REAL NOT NULL,
      cash REAL NOT NULL,
      loan_balance REAL NOT NULL DEFAULT 0,
      total_loaned REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (round_id) REFERENCES rounds(id),
      UNIQUE(round_id, name)
    );

    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(id),
      UNIQUE(player_id, ticker)
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      turn INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      action TEXT NOT NULL,
      shares REAL NOT NULL,
      price_per_share REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `)

  // Migrate legacy databases that still have a pin column
  const playerColumns = db.prepare('PRAGMA table_info(players)').all() as Array<{ name: string }>
  if (playerColumns.some(col => col.name === 'pin')) {
    db.exec('ALTER TABLE players DROP COLUMN pin')
  }

  migrateIntegerSharesToReal(db, 'holdings')
  migrateIntegerSharesToReal(db, 'trades')

  const playerColumnNames = playerColumns.map(col => col.name)
  if (!playerColumnNames.includes('loan_balance')) {
    db.exec('ALTER TABLE players ADD COLUMN loan_balance REAL NOT NULL DEFAULT 0')
  }
  if (!playerColumnNames.includes('total_loaned')) {
    db.exec('ALTER TABLE players ADD COLUMN total_loaned REAL NOT NULL DEFAULT 0')
  }
}
