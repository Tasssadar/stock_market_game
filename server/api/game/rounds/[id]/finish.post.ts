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

  db.prepare('UPDATE rounds SET status = ? WHERE id = ?').run('finished', id)

  return {
    success: true,
    message: 'Kolo bylo ukončeno'
  }
})
