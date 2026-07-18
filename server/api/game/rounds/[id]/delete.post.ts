import { getGameDb } from '../../../../utils/gameDb'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = getGameDb()

  const round = db.prepare('SELECT id, name FROM rounds WHERE id = ?').get(id) as { id: number; name: string } | undefined
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }

  const erase = db.transaction(() => {
    db.prepare(`
      DELETE FROM trades
      WHERE player_id IN (SELECT id FROM players WHERE round_id = ?)
    `).run(id)
    db.prepare(`
      DELETE FROM holdings
      WHERE player_id IN (SELECT id FROM players WHERE round_id = ?)
    `).run(id)
    db.prepare('DELETE FROM players WHERE round_id = ?').run(id)
    const result = db.prepare('DELETE FROM rounds WHERE id = ?').run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
    }
  })

  erase()

  return {
    success: true,
    message: `Kolo "${round.name}" bylo smazáno`
  }
})
