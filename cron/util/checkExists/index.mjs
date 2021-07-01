import { TIMESTAMP, SEASON, YEAR } from '../../constants/index.mjs'
import { store, ratingStats, doNotPrune, year, startSeason } from '../index.mjs'

export function checkExists ({ ratingFrequencies, id, canonicalTitle, subtype, favoritesCount, startDate }) {
  const ratings = ratingStats(ratingFrequencies)
  let currentlyAiring = false

  if (ratings.usersRated < 1) {
    store.count.skipped.push(canonicalTitle)
    return
  }

  // Started airing in the current season - excluding leftovers
  if (startSeason(startDate) === SEASON && year(startDate) === YEAR) {
    currentlyAiring = true
    store.currentlyAiring.push(canonicalTitle)
  }

  const entry = store.data.data.find(anime => anime.i === ~~id)
  if (entry) {
    doNotPrune(~~id)
    store.count.updated.push(canonicalTitle)
    entry.i = ~~id,
    entry.t = canonicalTitle
    entry.u = subtype === 'TV' ? 0 : 1 // 0: TV, 1: ONA
    entry.n = currentlyAiring ? 1 : 0 // 1: New, 0: Leftover
    entry.d.push(Object.assign(
      {
        i: entry.d[entry.d.length - 1].i + 1 || 0, // Increment index
        d: ~~(TIMESTAMP / 36e5).toFixed(0), // Hours since epoch
        w: ratings.wilson,
        l: ratings.laplace,
        p: ratings.upvotes,
        o: ratings.downvotes,
        r: ~~ratings.usersRated
      },
      ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
    ))
  } else {
    store.count.added.push(canonicalTitle)
    store.data.data.push({
      i: ~~id,
      t: canonicalTitle,
      u: subtype === 'TV' ? 0 : 1, // 0: TV, 1: ONA
      n: currentlyAiring ? 1 : 0, // 1: New, 0: Leftover
      d: [Object.assign(
        {
          i: 0, // Index
          d: ~~(TIMESTAMP / 36e5).toFixed(0), // Hours since epoch
          w: ratings.wilson,
          l: ratings.laplace,
          p: ratings.upvotes,
          o: ratings.downvotes,
          r: ~~ratings.usersRated
        },
        ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
      )]
    })
  }
  return
}
