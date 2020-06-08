import { UTC } from '../'
import { seasonByMonth } from '../'

export function seasonByDate (date = null) {
  if (date === null) return null
  return seasonByMonth(new UTC(date).getUTCMonth())
}
