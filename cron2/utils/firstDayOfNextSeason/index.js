import { nextSeasonYear, monthBySeason } from '../'

export function firstDayOfNextSeason (season = null, year = null) {
  if (season === null && year === null) return null
  const nextSeason = nextSeasonYear(season, year)
  const month = monthBySeason(nextSeason.season) + 1
  const month00 = month.toString().padStart(2, '0')
  return new Date(`${nextSeason.year}-${month00}-01T00:00:00.000Z`)
}
