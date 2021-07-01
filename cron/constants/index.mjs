import { season, year } from '../util/index.mjs'
//import { year } from '../util/year'


export const NOW = new Date().toISOString()
export const TIMESTAMP = new Date(NOW).getTime()

export const RANGE = 20
export const API_ANIME_FIELD = 'canonicalTitle,ratingFrequencies,favoritesCount,subtype,startDate,endDate,status'
export const API_SORT = '-averageRating,-userCount'

export const SEASON = season()
export const USSEASON = SEASON === 'autumn' ? 'fall' : SEASON
export const YEAR = year()

export const KEEP_IF_ENDED_AFTER =
  SEASON === 'winter' ? `${YEAR}-01-15` :
  SEASON === 'spring' ? `${YEAR}-04-15` :
  SEASON === 'summer' ? `${YEAR}-07-15` :
  `${YEAR}-10-15`

export const FILE = `./data/${YEAR}-${SEASON}.json5`
