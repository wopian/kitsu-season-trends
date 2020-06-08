import { seasonByDate, yearByDate, firstDayOfSeason, UTC } from '../'

// Anime that started airing in December are part of the Winter season
export function seasonStart (date = null) {
  if (date === null) return null
  const firstDay = firstDayOfSeason(seasonByDate(date), yearByDate(date))
  return new UTC(firstDay.setUTCMonth(firstDay.getUTCMonth() - 1))
}
