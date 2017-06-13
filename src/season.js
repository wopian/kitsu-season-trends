export function year () {
  let year = new Date().getFullYear()
  // December 2016 is 2017-winter
  // if (season() === 'winter' && new Date().getMonth() + 1 === 12) year++
  return year
}

export function season () {
  switch (new Date().getMonth() + 1) {
    case 1:
    case 2:
    case 3:
      return 'winter'
    case 4:
    case 5:
    case 6:
      return 'spring'
    case 7:
    case 8:
    case 9:
      return 'summer'
    case 10:
    case 11:
    case 12:
      return 'fall'
  }
  /*
  switch (new Date().getMonth() + 1) {
    case 12:
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
      return 'fall'
  }
  */
}
