import { getDb } from '../utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const tickersQuery = query.tickers as string
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const priceTypesQuery = query.priceTypes as string
  
  if (!tickersQuery) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tickers parameter is required (comma-separated).'
    })
  }
  
  const tickers = tickersQuery
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    
  if (tickers.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one valid ticker must be specified.'
    })
  }
  
  // Parse and validate price types
  const allowedPriceTypes = ['open', 'high', 'low', 'close', 'adj_close']
  const priceTypes = priceTypesQuery
    ? priceTypesQuery
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter((p) => allowedPriceTypes.includes(p))
    : ['close']
    
  const validPriceTypes = priceTypes.length > 0 ? priceTypes : ['close']
  
  const db = getDb()
  
  // Dynamic tickers placeholder (?, ?, ?, ...)
  const placeholders = tickers.map(() => '?').join(',')
  
  let sql = `
    SELECT ticker, date, ${validPriceTypes.join(', ')}
    FROM prices
    WHERE ticker IN (${placeholders})
  `
  const params: any[] = [...tickers]
  
  if (startDate) {
    sql += ' AND date >= ?'
    params.push(startDate)
  }
  
  if (endDate) {
    sql += ' AND date <= ?'
    params.push(endDate)
  }
  
  sql += ' ORDER BY date ASC'
  
  try {
    const rows = db.prepare(sql).all(...params) as any[]
    
    // Pivot data by date
    // Target format: [ { date: 'YYYY-MM-DD', AAPL_close: 100, AAPL_open: 98, MSFT_close: 150 }, ... ]
    const pivotedMap = new Map<string, any>()
    
    for (const row of rows) {
      const { date, ticker } = row
      if (!pivotedMap.has(date)) {
        pivotedMap.set(date, { date })
      }
      const dateObj = pivotedMap.get(date)
      
      for (const priceType of validPriceTypes) {
        // e.g. 'AAPL_close'
        dateObj[`${ticker}_${priceType}`] = row[priceType]
      }
    }
    
    const pivotedData = Array.from(pivotedMap.values())
    const seriesKeys = tickers.flatMap((t) =>
      validPriceTypes.map((p) => `${t}_${p}`)
    )
    
    return {
      success: true,
      data: pivotedData,
      seriesKeys
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Database query failed: ${error.message}`
    })
  }
})
