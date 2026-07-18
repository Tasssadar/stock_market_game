import { getGameDb } from '../../../utils/gameDb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { round_id, player_id } = body as { round_id: number; player_id: number }

  if (!round_id || !player_id) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí round_id nebo player_id' })
  }

  const db = getGameDb()

  const player = db.prepare(`
    SELECT p.id, p.name, p.round_id, p.starting_money, p.cash, p.loan_balance, p.total_loaned
    FROM players p
    WHERE p.id = ? AND p.round_id = ?
  `).get(player_id, round_id) as any

  if (!player) {
    throw createError({ statusCode: 404, statusMessage: 'Hráč nenalezen v tomto kole' })
  }

  const round = db.prepare('SELECT id, name, status, current_turn, start_date, turn_length_days FROM rounds WHERE id = ?').get(round_id) as any

  return {
    success: true,
    player,
    round
  }
})
