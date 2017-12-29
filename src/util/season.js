export const season = (date = new Date()) => {
  if (date === null) return null
  switch (new Date(date).getMonth()) {
    case 0:
    case 1:
    case 2:
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
