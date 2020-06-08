import { nextSeasonYear, firstDayOfSeason } from '../'

export function firstDayOfNextSeason (season = null, year = null) {
  if (season === null && year === null) return null
  const nextSeason = nextSeasonYear(season, year)
  return firstDayOfSeason(nextSeason.season, nextSeason.year)
}
