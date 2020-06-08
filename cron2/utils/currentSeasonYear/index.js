import { seasonByDate, yearByDate, UTC } from '../'

export function currentSeasonYear () {
  const date = new UTC()
  return {
    season: seasonByDate(date),
    year: yearByDate(date),
    current: true
  }
}
