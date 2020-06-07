export function monthBySeason (season = null) {
  if (season === null) return null
  switch (season) {
    case 'winter':
      return 0
    case 'spring':
      return 3
    case 'summer':
      return 6
    case 'autumn':
      return 9
  }
}
