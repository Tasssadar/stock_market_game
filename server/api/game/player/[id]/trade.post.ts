import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import {
  getRoundCurrentDate,
  getClosePrice,
  parseShareQuantity,
  normalizeShares,
  isEffectivelyZeroShares,
  isTickerBuyableAtDate,
  allocateBuyFunds,
  InvalidShareQuantityError
} from '../../../../utils/gameHelpers'

export default defineEventHandler(async (event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { ticker, action, shares: rawShares } = body as {
    ticker: string
    action: 'buy' | 'sell'
    shares: number
  }

  if (!ticker || !action || rawShares === undefined || rawShares === null) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí povinné údaje' })
  }
  if (action !== 'buy' && action !== 'sell') {
    throw createError({ statusCode: 400, statusMessage: 'Akce musí být buy nebo sell' })
  }

  let shares: number
  try {
    shares = parseShareQuantity(rawShares)
  } catch (e) {
    if (e instanceof InvalidShareQuantityError) {
      throw createError({ statusCode: 400, statusMessage: e.message })
    }
    throw e
  }

  const db = getGameDb()
  const stockDb = getDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Hráč nenalezen' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any
  if (round.status !== 'active') {
    throw createError({ statusCode: 400, statusMessage: 'Obchodování je dostupné pouze v aktivním kole' })
  }

  const tickerExists = stockDb.prepare('SELECT ticker FROM tickers WHERE ticker = ?').get(ticker)
  if (!tickerExists) {
    throw createError({ statusCode: 400, statusMessage: `Neznámý ticker: ${ticker}` })
  }

  const currentDate = getRoundCurrentDate(round)

  if (action === 'buy' && !isTickerBuyableAtDate(stockDb, ticker, currentDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Ticker ${ticker} není k datu ${currentDate} dostupný k nákupu`
    })
  }

  const price = getClosePrice(stockDb, ticker, currentDate)
  if (price === null) {
    throw createError({ statusCode: 400, statusMessage: `Cena pro ticker ${ticker} není k dispozici` })
  }

  const total = price * shares

  const execute = db.transaction(() => {
    if (action === 'buy') {
      const loanBalance = player.loan_balance ?? 0
      const allocation = allocateBuyFunds(player.cash, loanBalance, total)
      if (!allocation) {
        const spendable = player.cash + loanBalance
        throw createError({
          statusCode: 400,
          statusMessage: `Nedostatek prostředků. Máte $${spendable.toFixed(2)} (hotovost $${player.cash.toFixed(2)}, půjčka $${loanBalance.toFixed(2)}), potřebujete $${total.toFixed(2)}`
        })
      }

      db.prepare('UPDATE players SET cash = ?, loan_balance = ? WHERE id = ?').run(
        allocation.newCash,
        allocation.newLoanBalance,
        playerId
      )

      const existing = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND ticker = ?').get(playerId, ticker) as any
      if (existing) {
        const newShares = normalizeShares(existing.shares + shares)
        db.prepare('UPDATE holdings SET shares = ? WHERE player_id = ? AND ticker = ?').run(newShares, playerId, ticker)
      } else {
        db.prepare('INSERT INTO holdings (player_id, ticker, shares) VALUES (?, ?, ?)').run(playerId, ticker, shares)
      }
    } else {
      const holding = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND ticker = ?').get(playerId, ticker) as any
      if (!holding || holding.shares + 0.0001 < shares) {
        throw createError({
          statusCode: 400,
          statusMessage: `Nemáte dostatek akcií. Vlastníte ${holding?.shares ?? 0} kusů.`
        })
      }

      db.prepare('UPDATE players SET cash = cash + ? WHERE id = ?').run(total, playerId)

      const newShares = normalizeShares(holding.shares - shares)
      if (isEffectivelyZeroShares(newShares)) {
        db.prepare('DELETE FROM holdings WHERE player_id = ? AND ticker = ?').run(playerId, ticker)
      } else {
        db.prepare('UPDATE holdings SET shares = ? WHERE player_id = ? AND ticker = ?').run(newShares, playerId, ticker)
      }
    }

    db.prepare(`
      INSERT INTO trades (player_id, turn, ticker, action, shares, price_per_share, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(playerId, round.current_turn, ticker, action, shares, price, total)
  })

  execute()

  const updatedPlayer = db.prepare('SELECT cash, loan_balance, total_loaned FROM players WHERE id = ?').get(playerId) as any

  return {
    success: true,
    message: action === 'buy'
      ? `Koupeno ${shares} ks ${ticker} za $${total.toFixed(2)}`
      : `Prodáno ${shares} ks ${ticker} za $${total.toFixed(2)}`,
    price_per_share: price,
    total,
    new_cash: updatedPlayer.cash,
    new_loan_balance: updatedPlayer.loan_balance,
    total_loaned: updatedPlayer.total_loaned
  }
})
