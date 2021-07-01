import { getSeasonByMonth, UTC } from "../"

export function getSeasonByDate (date = null) {
  if (date === null) return null
  return getSeasonByMonth(new UTC(date).getUTCMonth())
}