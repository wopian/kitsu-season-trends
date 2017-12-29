export const sort = (data, by) => {
  return Object.values(data).sort((A, B) => {
    let a = null, b = null

    if (by === 'r') {
      a = A.d.slice(-1)[0][by] / A.d.slice(-1)[0].u
      b = B.d.slice(-1)[0][by] / B.d.slice(-1)[0].u
    } else {
      a = A.d.slice(-1)[0][by]
      b = B.d.slice(-1)[0][by]
    }

    /*
    if (by === 'r') {
      a = A[by].slice(-1)[0] / A['u'].slice(-1)[0]
      b = B[by].slice(-1)[0] / B['u'].slice(-1)[0]
    } else {
      a = A[by] instanceof Array ? A[by].slice(-1)[0] : A[by]
      b = B[by] instanceof Array ? B[by].slice(-1)[0] : B[by]
    }
    */
    return a > b ? -1 : a < b ? 1 : 0
  })
}
