import { getGameDb } from '../../../utils/gameDb'
import { getDb } from '../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = getGameDb()
  const stockDb = getDb()

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(id) as any
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const players = db.prepare('SELECT * FROM players WHERE round_id = ? ORDER BY name ASC').all(id) as any[]

  // Calculate portfolio values for each player
  const currentDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  const playersWithValue = players.map((p: any) => {
    const holdings = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND shares > 0').all(p.id) as any[]

    let holdingsValue = 0
    const holdingsWithPrice = holdings.map((h: any) => {
      const price = getClosePrice(stockDb, h.ticker, currentDate) ?? 0
      const value = price * h.shares
      holdingsValue += value
      return { ...h, current_price: price, value }
    })

    const totalValue = p.cash + holdingsValue
    const profit = totalValue - p.starting_money
    const profitPercent = p.starting_money > 0 ? (profit / p.starting_money) * 100 : 0

    return {
      ...p,
      pin: undefined, // don't expose pin in round detail
      holdings: holdingsWithPrice,
      holdings_value: holdingsValue,
      total_value: totalValue,
      profit,
      profit_percent: profitPercent
    }
  })

  // Sort by total value desc for leaderboard
  const ranked = [...playersWithValue].sort((a, b) => b.total_value - a.total_value)

  return {
    success: true,
    data: {
      ...round,
      current_date: currentDate,
      players: ranked
    }
  }
})
