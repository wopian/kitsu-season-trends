import { monthBySeason, UTC } from '../'

export function firstDayOfSeason (season = null, year = null) {
  if (season === null && year === null) return null
  const month = monthBySeason(season) + 1
  const month00 = month.toString().padStart(2, '0')
  return new UTC(`${year}-${month00}-01`)
}
