import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../../utils/gameHelpers'

export default defineEventHandler((event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const pin = query.pin as string
  const ticker = query.ticker as string

  if (!pin) {
    throw createError({ statusCode: 401, statusMessage: 'PIN je povinný' })
  }
  if (!ticker) {
    throw createError({ statusCode: 400, statusMessage: 'Parametr ticker je povinný' })
  }

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player || player.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: 'Nesprávný PIN' })
  }

  const tickerExists = stockDb.prepare('SELECT ticker FROM tickers WHERE ticker = ?').get(ticker)
  if (!tickerExists) {
    throw createError({ statusCode: 400, statusMessage: `Neznámý ticker: ${ticker}` })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any
  const currentDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  const price = getClosePrice(stockDb, ticker, currentDate)
  if (price === null) {
    throw createError({ statusCode: 400, statusMessage: `Cena pro ${ticker} není k dispozici k datu ${currentDate}` })
  }

  const holding = db.prepare('SELECT shares FROM holdings WHERE player_id = ? AND ticker = ?').get(playerId, ticker) as any

  return {
    success: true,
    data: {
      ticker,
      price,
      date: currentDate,
      turn: round.current_turn,
      owned_shares: holding?.shares ?? 0
    }
  }
})
