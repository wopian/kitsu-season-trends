export function getSeasonByMonth (month = null) {
  if (month === null) return null

  // 0 = January. 11 and 12 = December (0-indexed for date and 1-indexed for airing date)
  switch (month) {
    case 0:
    case 1:
    case 2:
    case 12:
      return 'winter'
    case 3:
    case 4:
    case 5:
      return 'spring'
    case 6:
    case 7:
    case 8:
      return 'summer'
    case 9:
    case 10:
    case 11:
      return 'autumn'
  }
}
