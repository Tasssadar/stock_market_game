import { getGameDb } from '../../../../utils/gameDb'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = getGameDb()

  const round = db.prepare('SELECT id FROM rounds WHERE id = ?').get(id)
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const players = db.prepare(`
    SELECT id, name FROM players WHERE round_id = ? ORDER BY name ASC
  `).all(id)

  return {
    success: true,
    data: players
  }
})
