import path from 'path'
import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = path.resolve(process.cwd(), 'stock_market.db')
    dbInstance = new Database(dbPath, { readonly: true })
  }
  return dbInstance
}
