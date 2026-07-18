import { getGameDb } from '../../../../utils/gameDb'

export default defineEventHandler(async (event) => {
  const playerId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { amount: rawAmount } = body as { amount: number }

  const amount = Number(rawAmount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Částka půjčky musí být kladné číslo' })
  }

  const db = getGameDb()

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Hráč nenalezen' })
  }

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(player.round_id) as any
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  if (round.status === 'finished') {
    throw createError({ statusCode: 400, statusMessage: 'Nelze poskytnout půjčku v ukončeném kole' })
  }

  db.prepare(`
    UPDATE players
    SET loan_balance = loan_balance + ?, total_loaned = total_loaned + ?
    WHERE id = ?
  `).run(amount, amount, playerId)

  const updatedPlayer = db.prepare(`
    SELECT cash, loan_balance, total_loaned FROM players WHERE id = ?
  `).get(playerId) as { cash: number; loan_balance: number; total_loaned: number }

  return {
    success: true,
    message: `Půjčka $${amount.toFixed(2)} poskytnuta hráči ${player.name}`,
    cash: updatedPlayer.cash,
    loan_balance: updatedPlayer.loan_balance,
    total_loaned: updatedPlayer.total_loaned
  }
})
