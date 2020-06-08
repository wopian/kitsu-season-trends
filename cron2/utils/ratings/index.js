import weighted from 'weighted-mean'

export function ratingsfrom20 (frequency) {
  return Object.keys(frequency).map(key => [ key / 2, +frequency[key] ])
}

export function ratings (frequency) {
  const ratings1To10 = ratingsfrom20(frequency)
  const usersRated = ratings1To10.reduce((sum, x) => ~~x[1] + ~~(sum[1] ? sum[1] : sum), 0)
  const mean = Number(+weighted(ratings1To10).toFixed(2)) || 0
  return { mean, usersRated }
}
