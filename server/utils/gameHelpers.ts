/**
 * Calculate the date corresponding to a given turn number.
 * Turn 1 = start_date, Turn 2 = start_date + turn_length_days, etc.
 */
export function getTurnDate(startDate: string, turnLengthDays: number, turn: number): string {
  const date = new Date(startDate)
  date.setDate(date.getDate() + (turn - 1) * turnLengthDays)
  return date.toISOString().split('T')[0]!
}

export function getRoundCurrentDate(round: {
  start_date: string
  turn_length_days: number
  current_turn: number
}): string {
  return round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date
}

export function getTickerDateBounds(
  stockDb: any,
  ticker: string
): { first_date: string; last_date: string } | null {
  const row = stockDb.prepare(`
    SELECT MIN(date) AS first_date, MAX(date) AS last_date
    FROM prices
    WHERE ticker = ?
  `).get(ticker) as { first_date: string | null; last_date: string | null } | undefined

  if (!row?.first_date || !row?.last_date) return null
  return { first_date: row.first_date, last_date: row.last_date }
}

export function isTickerBuyableAtDate(stockDb: any, ticker: string, asOfDate: string): boolean {
  const bounds = getTickerDateBounds(stockDb, ticker)
  if (!bounds) return false
  return bounds.first_date <= asOfDate && asOfDate <= bounds.last_date
}

export function getBuyableTickers(stockDb: any, asOfDate: string) {
  return stockDb.prepare(`
    SELECT t.ticker, t.popis
    FROM tickers t
    INNER JOIN (
      SELECT ticker, MIN(date) AS first_date, MAX(date) AS last_date
      FROM prices
      GROUP BY ticker
    ) p ON p.ticker = t.ticker
    WHERE p.first_date <= ? AND p.last_date >= ?
    ORDER BY t.ticker ASC
  `).all(asOfDate, asOfDate) as Array<{ ticker: string; popis: string }>
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

export const SHARE_PRECISION = 0.01
export const SHARE_EPSILON = 0.0001

export function normalizeShares(shares: number): number {
  return Math.round(shares * 100) / 100
}

export class InvalidShareQuantityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidShareQuantityError'
  }
}

export function parseShareQuantity(shares: unknown): number {
  const value = Number(shares)
  if (!Number.isFinite(value) || value <= 0) {
    throw new InvalidShareQuantityError('Počet kusů musí být kladné číslo')
  }

  const normalized = normalizeShares(value)
  if (normalized <= 0) {
    throw new InvalidShareQuantityError('Počet kusů musí být alespoň 0.01')
  }
  if (Math.abs(value - normalized) > SHARE_EPSILON) {
    throw new InvalidShareQuantityError('Počet kusů musí být násobkem 0.01')
  }

  return normalized
}

export function isEffectivelyZeroShares(shares: number): boolean {
  return shares <= SHARE_EPSILON
}

export function allocateBuyFunds(cash: number, loanBalance: number, total: number) {
  if (cash + loanBalance + SHARE_EPSILON < total) {
    return null
  }

  const fromCash = Math.min(cash, total)
  const fromLoan = total - fromCash

  return {
    fromCash,
    fromLoan,
    newCash: cash - fromCash,
    newLoanBalance: loanBalance - fromLoan
  }
}
