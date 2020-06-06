import { seasonByDate, yearByDate } from '../'

export function currentSeasonYear () {
  const date = new Date()
  return {
    season: seasonByDate(date),
    year: yearByDate(date)
  }
}
