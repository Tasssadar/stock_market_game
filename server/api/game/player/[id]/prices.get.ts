import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getTurnDate } from '../../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const pin = query.pin as string
  const tickersQuery = query.tickers as string

  if (!pin) {
    throw createError({ statusCode: 401, statusMessage: 'PIN je povinný' })
  }
  if (!tickersQuery) {
    throw createError({ statusCode: 400, statusMessage: 'Parametr tickers je povinný' })
  }

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player || player.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: 'Nesprávný PIN' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any

  // Enforce: players can only see prices up to current turn date
  const cutoffDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  const tickers = tickersQuery.split(',').map((t: string) => t.trim()).filter(Boolean)
  const placeholders = tickers.map(() => '?').join(',')

  const rows = stockDb.prepare(`
    SELECT ticker, date, open, high, low, close
    FROM prices
    WHERE ticker IN (${placeholders})
      AND date <= ?
    ORDER BY date ASC
  `).all(...tickers, cutoffDate) as any[]

  // Pivot by date (same format as main prices API)
  const pivotedMap = new Map<string, any>()
  for (const row of rows) {
    const { date, ticker } = row
    if (!pivotedMap.has(date)) {
      pivotedMap.set(date, { date })
    }
    const dateObj = pivotedMap.get(date)
    dateObj[`${ticker}_close`] = row.close
    dateObj[`${ticker}_open`] = row.open
    dateObj[`${ticker}_high`] = row.high
    dateObj[`${ticker}_low`] = row.low
  }

  const pivotedData = Array.from(pivotedMap.values())
  const seriesKeys = tickers.flatMap((t: string) =>
    ['close', 'open', 'high', 'low'].map((p) => `${t}_${p}`)
  )

  return {
    success: true,
    data: pivotedData,
    seriesKeys,
    cutoff_date: cutoffDate,
    current_turn: round.current_turn
  }
})
