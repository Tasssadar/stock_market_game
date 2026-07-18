import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const pin = query.pin as string

  if (!pin) {
    throw createError({ statusCode: 401, statusMessage: 'PIN je povinný' })
  }

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player || player.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: 'Nesprávný PIN' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any

  const currentDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  // Get holdings with current prices
  const holdings = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND shares > 0').all(playerId) as any[]

  let holdingsValue = 0
  const holdingsWithPrice = holdings.map((h: any) => {
    const price = getClosePrice(stockDb, h.ticker, currentDate) ?? 0
    const value = price * h.shares
    holdingsValue += value
    return { ...h, current_price: price, value }
  })

  // Get recent trades
  const trades = db.prepare(`
    SELECT * FROM trades WHERE player_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(playerId)

  const totalValue = player.cash + holdingsValue
  const profit = totalValue - player.starting_money
  const profitPercent = player.starting_money > 0 ? (profit / player.starting_money) * 100 : 0

  return {
    success: true,
    data: {
      player: {
        id: player.id,
        name: player.name,
        cash: player.cash,
        starting_money: player.starting_money
      },
      round: {
        id: round.id,
        name: round.name,
        status: round.status,
        current_turn: round.current_turn,
        current_date: currentDate
      },
      holdings: holdingsWithPrice,
      holdings_value: holdingsValue,
      total_value: totalValue,
      profit,
      profit_percent: profitPercent,
      trades
    }
  }
})
