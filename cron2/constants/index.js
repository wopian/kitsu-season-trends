import { UTC } from '../utils'

export const TIMESTAMP = new UTC().valueOf()

// Number of resources per request
export const RANGE = 20

export const API_ANIME_FIELD = 'canonicalTitle,ratingFrequencies,userCount,favoritesCount,subtype,startDate,endDate,status'
export const API_SORT = '-averageRating,-userCount'
