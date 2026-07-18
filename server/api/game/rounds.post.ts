import { getGameDb } from '../../utils/gameDb'

interface PlayerInput {
  name: string
  starting_money: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, start_date, turn_length_days, players } = body as {
    name: string
    start_date: string
    turn_length_days: number
    players: PlayerInput[]
  }

  if (!name || !start_date || !turn_length_days || !players?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chybí povinné údaje: name, start_date, turn_length_days, players'
    })
  }

  const db = getGameDb()

  const roundResult = db.prepare(`
    INSERT INTO rounds (name, start_date, turn_length_days)
    VALUES (?, ?, ?)
  `).run(name, start_date, turn_length_days)

  const roundId = roundResult.lastInsertRowid as number

  const insertPlayer = db.prepare(`
    INSERT INTO players (round_id, name, starting_money, cash)
    VALUES (?, ?, ?, ?)
  `)

  const createdPlayers: Array<{ name: string; id: number }> = []

  const insertAll = db.transaction(() => {
    for (const p of players) {
      const result = insertPlayer.run(roundId, p.name.trim(), p.starting_money, p.starting_money)
      createdPlayers.push({
        name: p.name.trim(),
        id: result.lastInsertRowid as number
      })
    }
  })

  insertAll()

  return {
    success: true,
    round: {
      id: roundId,
      name,
      start_date,
      turn_length_days,
      status: 'setup'
    },
    players: createdPlayers
  }
})
