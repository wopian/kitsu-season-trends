import { seasonByMonth } from '../'

export function seasonByDate (date = null) {
  if (date === null) return null
  return seasonByMonth(new Date(date).getMonth())
}
