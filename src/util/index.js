export function year () {
  return new Date().getFullYear()
  // December 2016 is 2017-winter
  // if (season() === 'winter' && new Date().getMonth() + 1 === 12) year++
}

export function season () {
  switch (new Date().getMonth()) {
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
      return 'fall'
  }
}

export function sort (data, by) {
  return Object.values(data).sort((A, B) => {
    let a, b
    if (by === 'usersRated') {
      a = A[by].slice(-1)[0] / A['users'].slice(-1)[0]
      b = B[by].slice(-1)[0] / B['users'].slice(-1)[0]
    } else {
      a = A[by] instanceof Array ? A[by].slice(-1)[0] : A[by]
      b = B[by] instanceof Array ? B[by].slice(-1)[0] : B[by]
    }
    return a > b ? -1 : a < b ? 1 : 0
  })
}
