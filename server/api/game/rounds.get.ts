import { getGameDb } from '../../utils/gameDb'

export default defineEventHandler(() => {
  const db = getGameDb()

  const rounds = db.prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM players WHERE round_id = r.id) as player_count
    FROM rounds r
    ORDER BY r.created_at DESC
  `).all()

  return {
    success: true,
    data: rounds
  }
})
