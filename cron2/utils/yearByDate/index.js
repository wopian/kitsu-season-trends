import { UTC } from '../'

export function yearByDate (date = null) {
  if (date === null) return null
  return new UTC(date).getFullYear()
}
