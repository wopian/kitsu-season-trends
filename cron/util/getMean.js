import wmean from 'weighted-mean'

export function getMean (frequency) {
  try {
    const ratings = Object.keys(frequency).map(key => [ key / 2, +frequency[key] ])
    // 1.20 => 1.2, 1.21 => 1.21, undefined/null => 0
    const mean = Number(+wmean(ratings).toFixed(2)) || 0
    const usersRated = ratings.reduce((sum, x) => ~~x[1] + ~~(sum[1] ? sum[1] : sum), 0)
    return { mean, usersRated }
  } catch (E) {
    throw E
  }
}
