import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../../utils/gameHelpers'

export default defineEventHandler(async (event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { pin, ticker, action, shares } = body as {
    pin: string
    ticker: string
    action: 'buy' | 'sell'
    shares: number
  }

  if (!pin || !ticker || !action || !shares || shares <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí povinné údaje' })
  }
  if (action !== 'buy' && action !== 'sell') {
    throw createError({ statusCode: 400, statusMessage: 'Akce musí být buy nebo sell' })
  }

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player || player.pin !== pin) {
    throw createError({ statusCode: 401, statusMessage: 'Nesprávný PIN' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any
  if (round.status !== 'active') {
    throw createError({ statusCode: 400, statusMessage: 'Obchodování je dostupné pouze v aktivním kole' })
  }

  const currentDate = getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
  const price = getClosePrice(stockDb, ticker, currentDate)

  if (price === null) {
    throw createError({ statusCode: 400, statusMessage: `Cena pro ticker ${ticker} není k dispozici` })
  }

  const total = price * shares

  // Validate ticker exists in stock DB
  const tickerExists = stockDb.prepare('SELECT ticker FROM tickers WHERE ticker = ?').get(ticker)
  if (!tickerExists) {
    throw createError({ statusCode: 400, statusMessage: `Neznámý ticker: ${ticker}` })
  }

  const execute = db.transaction(() => {
    if (action === 'buy') {
      if (player.cash < total) {
        throw createError({
          statusCode: 400,
          statusMessage: `Nedostatek prostředků. Máte $${player.cash.toFixed(2)}, potřebujete $${total.toFixed(2)}`
        })
      }

      // Deduct cash
      db.prepare('UPDATE players SET cash = cash - ? WHERE id = ?').run(total, playerId)

      // Update or insert holding
      const existing = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND ticker = ?').get(playerId, ticker) as any
      if (existing) {
        db.prepare('UPDATE holdings SET shares = shares + ? WHERE player_id = ? AND ticker = ?').run(shares, playerId, ticker)
      } else {
        db.prepare('INSERT INTO holdings (player_id, ticker, shares) VALUES (?, ?, ?)').run(playerId, ticker, shares)
      }
    } else {
      // Sell
      const holding = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND ticker = ?').get(playerId, ticker) as any
      if (!holding || holding.shares < shares) {
        throw createError({
          statusCode: 400,
          statusMessage: `Nemáte dostatek akcií. Vlastníte ${holding?.shares ?? 0} kusů.`
        })
      }

      // Add cash
      db.prepare('UPDATE players SET cash = cash + ? WHERE id = ?').run(total, playerId)

      // Reduce holding
      const newShares = holding.shares - shares
      if (newShares === 0) {
        db.prepare('DELETE FROM holdings WHERE player_id = ? AND ticker = ?').run(playerId, ticker)
      } else {
        db.prepare('UPDATE holdings SET shares = ? WHERE player_id = ? AND ticker = ?').run(newShares, playerId, ticker)
      }
    }

    // Record trade
    db.prepare(`
      INSERT INTO trades (player_id, turn, ticker, action, shares, price_per_share, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(playerId, round.current_turn, ticker, action, shares, price, total)
  })

  execute()

  const updatedPlayer = db.prepare('SELECT cash FROM players WHERE id = ?').get(playerId) as any

  return {
    success: true,
    message: action === 'buy'
      ? `Koupeno ${shares} ks ${ticker} za $${total.toFixed(2)}`
      : `Prodáno ${shares} ks ${ticker} za $${total.toFixed(2)}`,
    price_per_share: price,
    total,
    new_cash: updatedPlayer.cash
  }
})
