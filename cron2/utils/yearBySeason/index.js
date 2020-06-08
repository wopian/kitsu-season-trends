// Anime aired in December 2019 are part of Winter 2020
export function yearBySeason (date = null) {
  if (date === null) return null

  if (date.getUTCMonth() === 11) return date.getFullYear() + 1
  else return date.getFullYear()
}
