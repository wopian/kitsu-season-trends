import wmean from 'weighted-mean'

export function mean (frequency) {
  try {
    const ratings = Object.keys(frequency).map(key => [ key / 2, +frequency[key] ])
    const usersRated = ratings.reduce((sum, x) => ~~x[1] + ~~(sum[1] ? sum[1] : sum), 0)
    return { mean: Number(+wmean(ratings).toFixed(2)) || 0, usersRated }
  } catch (E) {
    throw E
  }
}
