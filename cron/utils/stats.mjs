import { stars, wilson } from 'wilson-rate'

const isBetween = (rating, min, max) =>
  max ? rating >= min && rating < max : rating >= min

const filterStars = (tenStars, min, max = Number.MAX_SAFE_INTEGER) => {
  const ratingsBetween = tenStars.map(ratings =>
    isBetween(ratings[0], min, max) ? ratings[1] : 0
  )
  const ratingsNonZero = ratingsBetween.filter(number_ => number_ !== 0)

  if (ratingsNonZero.length > 0) return ratingsNonZero.reduce((a, b) => a + b)

  return 0
}

const tenToFiveStars = tenStars => ({
  5: filterStars(tenStars, 8.5),
  4: filterStars(tenStars, 6.5, 8.5),
  3: filterStars(tenStars, 4.5, 6.5),
  2: filterStars(tenStars, 2.5, 4.5),
  1: filterStars(tenStars, 0.5, 2.5)
})

// Percentage with 2 decimal places, avoiding floating point imprecision and trailing zeroes
const decToPercent = decimal => Math.round(decimal.toFixed(6) * 1e4) / 1e2

// Laplace smoothing: https://en.wikipedia.org/wiki/Additive_smoothing
const laplace = (upvotes, downvotes) => {
  const totalVotes = upvotes + downvotes
  const α = 0
  const β = 5
  const score = (upvotes + α) / (totalVotes + β)

  return decToPercent(score)
}

export const ratingStats = frequency => {
  const ratings = Object.keys(frequency).map(key => [
    key / 2,
    +frequency[key]
  ])
  const usersRated = ratings.reduce(
    (sum, x) => Math.trunc(x[1]) + Math.trunc(sum[1] ? sum[1] : sum),
    0
  )
  const fiveStars = tenToFiveStars(ratings)
  const { upvotes, downvotes } = stars(
    fiveStars['5'],
    fiveStars['4'],
    fiveStars['3'],
    fiveStars['2'],
    fiveStars['1']
  )

  return {
    upvotes,
    downvotes,
    usersRated,
    wilson: decToPercent(wilson(upvotes, downvotes, 1.96)),
    laplace: laplace(upvotes, downvotes)
  }
}
