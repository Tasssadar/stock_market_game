import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getClosePrice, getTurnDate } from '../../../../utils/gameHelpers'

type NewsEntry = {
  player_id: number
  player_name: string
  ticker: string
  company_name: string
  shares_at_turn: number
  gain_amount: number
  gain_percent: number
}

export default defineEventHandler((event) => {
  const roundId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const turnParam = query.turn as string | undefined

  if (!Number.isFinite(roundId) || roundId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatné ID kola' })
  }

  const db = getGameDb()
  const stockDb = getDb()

  const round = db.prepare(`
    SELECT id, name, start_date, turn_length_days, current_turn
    FROM rounds
    WHERE id = ?
  `).get(roundId) as {
    id: number
    name: string
    start_date: string
    turn_length_days: number
    current_turn: number
  } | undefined

  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const turn = turnParam ? Number(turnParam) : round.current_turn - 1
  if (!Number.isInteger(turn)) {
    throw createError({ statusCode: 400, statusMessage: 'Parametr turn musí být celé číslo' })
  }
  if (turn < 1 || turn > round.current_turn) {
    throw createError({ statusCode: 400, statusMessage: 'Parametr turn je mimo rozsah kola' })
  }

  const players = db.prepare(`
    SELECT id, name
    FROM players
    WHERE round_id = ?
  `).all(roundId) as Array<{ id: number; name: string }>

  if (!players.length) {
    return {
      success: true,
      data: null
    }
  }

  const playerIds = players.map((p) => p.id)
  const playersById = new Map<number, string>(players.map((p) => [p.id, p.name]))
  const playerPlaceholders = playerIds.map(() => '?').join(',')

  const trades = db.prepare(`
    SELECT player_id, turn, ticker, action, shares
    FROM trades
    WHERE player_id IN (${playerPlaceholders})
      AND turn <= ?
    ORDER BY turn ASC, id ASC
  `).all(...playerIds, turn) as Array<{
    player_id: number
    turn: number
    ticker: string
    action: 'buy' | 'sell'
    shares: number
  }>

  const allTickers = Array.from(new Set(trades.map((t) => t.ticker)))
  if (!allTickers.length) {
    return {
      success: true,
      data: null
    }
  }

  const runningShares = new Map<string, number>()
  const keyOf = (playerId: number, ticker: string) => `${playerId}:${ticker}`

  for (const trade of trades) {
    const key = keyOf(trade.player_id, trade.ticker)
    const current = runningShares.get(key) ?? 0
    const delta = trade.action === 'buy' ? trade.shares : -trade.shares
    runningShares.set(key, Math.max(0, current + delta))
  }

  const turnDate = getTurnDate(round.start_date, round.turn_length_days, turn)
  // For turn 1, compare to turn 0 date (one turn-length before start),
  // then getClosePrice() resolves nearest available earlier market close.
  const previousTurnDate = getTurnDate(round.start_date, round.turn_length_days, turn - 1)

  const tickerPlaceholders = allTickers.map(() => '?').join(',')
  const tickerRows = stockDb.prepare(`
    SELECT ticker, popis
    FROM tickers
    WHERE ticker IN (${tickerPlaceholders})
  `).all(...allTickers) as Array<{ ticker: string; popis: string }>
  const companyByTicker = new Map<string, string>(tickerRows.map((r) => [r.ticker, r.popis ?? r.ticker]))

  const entries: NewsEntry[] = []
  for (const player of players) {
    for (const ticker of allTickers) {
      const sharesAtTurn = runningShares.get(keyOf(player.id, ticker)) ?? 0
      if (sharesAtTurn <= 0) continue

      const currentPrice = getClosePrice(stockDb, ticker, turnDate)
      const previousPrice = getClosePrice(stockDb, ticker, previousTurnDate)
      if (currentPrice === null || previousPrice === null || previousPrice <= 0) continue

      const delta = currentPrice - previousPrice
      const gainAmount = delta * sharesAtTurn
      const gainPercent = (delta / previousPrice) * 100

      entries.push({
        player_id: player.id,
        player_name: playersById.get(player.id) ?? `Hráč ${player.id}`,
        ticker,
        company_name: companyByTicker.get(ticker) ?? ticker,
        shares_at_turn: sharesAtTurn,
        gain_amount: gainAmount,
        gain_percent: gainPercent
      })
    }
  }

  if (!entries.length) {
    return {
      success: true,
      data: null
    }
  }

  const sortedByGain = [...entries].sort((a, b) => {
    if (b.gain_amount !== a.gain_amount) return b.gain_amount - a.gain_amount
    if (a.ticker !== b.ticker) return a.ticker.localeCompare(b.ticker)
    return a.player_name.localeCompare(b.player_name)
  })

  const topPositive = sortedByGain[0]!
  const topNegative = sortedByGain[sortedByGain.length - 1]!
  const selected = Math.abs(topPositive.gain_amount) >= Math.abs(topNegative.gain_amount)
    ? topPositive
    : topNegative

  return {
    success: true,
    data: {
      round: {
        id: round.id,
        name: round.name,
        turn,
        turn_date: turnDate,
        previous_turn_date: previousTurnDate
      },
      top_positive: topPositive,
      top_negative: topNegative,
      selected: {
        ...selected,
        polarity: selected.gain_amount >= 0 ? 'positive' : 'negative'
      }
    }
  }
})
