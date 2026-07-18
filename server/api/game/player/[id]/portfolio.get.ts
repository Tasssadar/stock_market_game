import { getGameDb } from '../../../../utils/gameDb'
import { getDb } from '../../../../utils/db'
import { getTurnDate, getClosePrice } from '../../../../utils/gameHelpers'

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

  const currentDate = round.current_turn > 0
    ? getTurnDate(round.start_date, round.turn_length_days, round.current_turn)
    : round.start_date

  const holdings = db.prepare('SELECT * FROM holdings WHERE player_id = ? AND shares > 0').all(playerId) as any[]
  const heldTickers = holdings.map((h: any) => h.ticker)

  const trades = db.prepare(`
    SELECT id, turn, ticker, action, shares, price_per_share, total, created_at
    FROM trades
    WHERE player_id = ?
    ORDER BY turn ASC, id ASC
  `).all(playerId) as Array<{
    id: number
    turn: number
    ticker: string
    action: 'buy' | 'sell'
    shares: number
    price_per_share: number
    total: number
    created_at: string
  }>

  const sharesByTurnByTicker = new Map<string, Map<number, number>>()
  for (const ticker of heldTickers) {
    sharesByTurnByTicker.set(ticker, new Map())
  }

  const runningShares = new Map<string, number>()
  for (const ticker of heldTickers) {
    runningShares.set(ticker, 0)
  }

  for (const trade of trades) {
    if (!sharesByTurnByTicker.has(trade.ticker)) continue
    const nextShares = (runningShares.get(trade.ticker) ?? 0) + (trade.action === 'buy' ? trade.shares : -trade.shares)
    runningShares.set(trade.ticker, Math.max(0, nextShares))
    sharesByTurnByTicker.get(trade.ticker)!.set(trade.turn, runningShares.get(trade.ticker)!)
  }

  let holdingsValue = 0
  const holdingsWithPrice = holdings.map((h: any) => {
    const price = getClosePrice(stockDb, h.ticker, currentDate) ?? 0
    const value = price * h.shares
    holdingsValue += value
    const performance_by_turn = [] as Array<{
      turn: number
      date: string
      shares_end_of_turn: number
      price: number
      gain_amount: number
      gain_percent: number
    }>
    let lastRecordedShares = 0
    let previousPrice: number | null = null

    for (let turn = 1; turn <= round.current_turn; turn++) {
      const turnDate = getTurnDate(round.start_date, round.turn_length_days, turn)
      const turnPrice = getClosePrice(stockDb, h.ticker, turnDate) ?? 0
      const sharesAtTurn = sharesByTurnByTicker.get(h.ticker)?.has(turn)
        ? sharesByTurnByTicker.get(h.ticker)!.get(turn)!
        : lastRecordedShares

      let gainAmount = 0
      let gainPercent = 0
      if (previousPrice !== null && previousPrice > 0) {
        const priceDelta = turnPrice - previousPrice
        gainAmount = priceDelta * sharesAtTurn
        gainPercent = (priceDelta / previousPrice) * 100
      }

      performance_by_turn.push({
        turn,
        date: turnDate,
        shares_end_of_turn: sharesAtTurn,
        price: turnPrice,
        gain_amount: gainAmount,
        gain_percent: gainPercent
      })

      lastRecordedShares = sharesAtTurn
      previousPrice = turnPrice
    }

    return { ...h, current_price: price, value, performance_by_turn }
  })
  const recentTrades = [...trades].sort((a, b) =>
    (b.created_at as string).localeCompare(a.created_at as string)
  ).slice(0, 50)

  const loanBalance = player.loan_balance ?? 0
  const totalLoaned = player.total_loaned ?? 0
  const totalValue = player.cash + loanBalance + holdingsValue
  const profit = totalValue - player.starting_money
  const profitPercent = player.starting_money > 0 ? (profit / player.starting_money) * 100 : 0

  return {
    success: true,
    data: {
      player: {
        id: player.id,
        name: player.name,
        cash: player.cash,
        loan_balance: loanBalance,
        total_loaned: totalLoaned,
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
      trades: recentTrades
    }
  }
})
