/**
 * Calculate the date corresponding to a given turn number.
 * Turn 1 = start_date, Turn 2 = start_date + turn_length_days, etc.
 */
export function getTurnDate(startDate: string, turnLengthDays: number, turn: number): string {
  const date = new Date(startDate)
  date.setDate(date.getDate() + (turn - 1) * turnLengthDays)
  return date.toISOString().split('T')[0]!
}

/**
 * Get close price for a ticker on a given date (or nearest earlier date).
 * Falls back to most recent available price before the target date.
 */
export function getClosePrice(stockDb: any, ticker: string, targetDate: string): number | null {
  const row = stockDb.prepare(`
    SELECT close FROM prices
    WHERE ticker = ? AND date <= ?
    ORDER BY date DESC
    LIMIT 1
  `).get(ticker, targetDate) as { close: number } | undefined

  return row?.close ?? null
}

/**
 * Generate a random 4-digit PIN.
 */
export function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}
