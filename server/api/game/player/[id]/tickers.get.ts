import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import {
  getRoundCurrentDate,
  getBuyableTickers
} from '../../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const playerId = Number(getRouterParam(event, 'id'))

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Hráč nenalezen' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const currentDate = getRoundCurrentDate(round)
  const buyable = getBuyableTickers(stockDb, currentDate)
  const buyableSet = new Set(buyable.map(t => t.ticker))

  const heldTickers = db.prepare(`
    SELECT DISTINCT ticker FROM holdings WHERE player_id = ? AND shares > 0
  `).all(playerId) as Array<{ ticker: string }>

  const sellOnly: Array<{ ticker: string; popis: string; sell_only: boolean }> = []
  for (const { ticker } of heldTickers) {
    if (buyableSet.has(ticker)) continue
    const info = stockDb.prepare('SELECT ticker, popis FROM tickers WHERE ticker = ?').get(ticker) as
      | { ticker: string; popis: string }
      | undefined
    if (!info) continue
    sellOnly.push({ ...info, sell_only: true })
  }

  const data = [
    ...buyable.map(t => ({ ...t, sell_only: false })),
    ...sellOnly.sort((a, b) => a.ticker.localeCompare(b.ticker))
  ]

  return {
    success: true,
    data,
    current_date: currentDate
  }
})
