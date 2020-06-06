import { seasonByMonth } from '../'

// Anime that started airing in December are part of the Winter season
export function seasonByStart (date = null) {
  if (date === null) return null
  return seasonByMonth(new Date(date).getMonth() + 1)
}
