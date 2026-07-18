import { getGameDb } from '../../../../utils/gameDb'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = getGameDb()

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(id) as any
  if (!round) {
    throw createError({ statusCode: 404, statusMessage: 'Kolo nenalezeno' })
  }
  if (round.status === 'finished') {
    throw createError({ statusCode: 400, statusMessage: 'Kolo je již ukončeno' })
  }

  const newTurn = round.current_turn + 1
  const newStatus = round.status === 'setup' ? 'active' : round.status

  db.prepare('UPDATE rounds SET current_turn = ?, status = ? WHERE id = ?')
    .run(newTurn, newStatus, id)

  const updated = db.prepare('SELECT * FROM rounds WHERE id = ?').get(id) as any

  return {
    success: true,
    data: updated,
    message: `Kolo posunuto na tah ${newTurn}`
  }
})
