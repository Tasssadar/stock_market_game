import { getDb } from '../utils/db'

export default defineEventHandler((event) => {
  try {
    const db = getDb()
    const tickers = db.prepare('SELECT ticker, popis FROM tickers ORDER BY ticker ASC').all()
    return {
      success: true,
      data: tickers
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch tickers: ${error.message}`
    })
  }
})
