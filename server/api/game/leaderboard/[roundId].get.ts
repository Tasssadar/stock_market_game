import { getGameDb } from '../../../utils/gameDb'
import { getDb } from '../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const roundId = Number(getRouterParam(event, 'roundId'))
  const db = getGameDb()
  const stockDb = getDb()

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(roundId) as any
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const currentDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  const players = db.prepare('SELECT * FROM players WHERE round_id = ?').all(roundId) as any[]

  const ranked = players.map((p: any) => {
    const holdings = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND shares > 0').all(p.id) as any[]

    let holdingsValue = 0
    for (const h of holdings) {
      const price = getClosePrice(stockDb, h.ticker, currentDate) ?? 0
      holdingsValue += price * h.shares
    }

    const totalValue = p.cash + holdingsValue
    const profit = totalValue - p.starting_money
    const profitPercent = p.starting_money > 0 ? (profit / p.starting_money) * 100 : 0

    return {
      id: p.id,
      name: p.name,
      cash: p.cash,
      holdings_value: holdingsValue,
      total_value: totalValue,
      starting_money: p.starting_money,
      profit,
      profit_percent: profitPercent
    }
  }).sort((a: any, b: any) => b.total_value - a.total_value)

  return {
    success: true,
    data: {
      round: {
        id: round.id,
        name: round.name,
        status: round.status,
        current_turn: round.current_turn,
        current_date: currentDate
      },
      rankings: ranked
    }
  }
})
