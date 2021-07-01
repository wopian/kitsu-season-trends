import { getSeasonByDate, UTC } from '..'

export function getSeasonYear ({ isCurrent = true } = {}) {
  let date = new UTC

  if (!isCurrent) date = date.setUTCMonth(date.getUTCMonth() - 1)

  return {
    season: getSeasonByDate(date),
    year: date.getUTCFullYear(),
    isCurrent
  }
}