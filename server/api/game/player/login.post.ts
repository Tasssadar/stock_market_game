import { getGameDb } from '../../../utils/gameDb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { round_id, name, pin } = body as { round_id: number; name: string; pin: string }

  if (!round_id || !name || !pin) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí round_id, name nebo pin' })
  }

  const db = getGameDb()

  const player = db.prepare(`
    SELECT p.id, p.name, p.round_id, p.starting_money, p.cash
    FROM players p
    WHERE p.round_id = ? AND p.name = ? AND p.pin = ?
  `).get(round_id, name.trim(), pin.trim()) as any

  if (!player) {
    throw createError({ statusCode: 401, statusMessage: 'Nesprávné jméno nebo PIN' })
  }

  const round = db.prepare('SELECT id, name, status, current_turn, start_date, turn_length_days FROM rounds WHERE id = ?').get(round_id) as any

  return {
    success: true,
    player,
    round
  }
})
