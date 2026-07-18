import { initGameDb } from '../utils/gameDb'

export default defineNitroPlugin(() => {
  initGameDb()
  console.log('[game] Game database initialized (game.db)')
})
