import { TIMESTAMP, SEASON, YEAR } from '../../constants'
import { store, mean, doNotPrune, year, startSeason } from '../'

export function checkExists ({ ratingFrequencies, id, canonicalTitle, subtype, userCount, favoritesCount, startDate }) {
  const ratings = mean(ratingFrequencies)

  if (ratings.usersRated < 5) {
    store.count.skipped.push(canonicalTitle)
    return
  }

  // Started airing in the current season - excluding leftovers
  if (startSeason(startDate) === SEASON && year(startDate) === YEAR) store.currentlyAiring.push(canonicalTitle)

  const entry = store.data.data.find(anime => anime.i === ~~id)
  if (entry) {
    doNotPrune(~~id)
    store.count.updated.push(canonicalTitle)
    entry.i = ~~id,
    entry.t = canonicalTitle
    entry.u = subtype === 'TV' ? 0 : 1 // 0: TV, 1: ONA
    entry.d.push(Object.assign(
      {
        i: entry.d[entry.d.length - 1].i + 1 || 0, // Increment index
        d: ~~(TIMESTAMP / 3600000).toFixed(0) // Hours since epoch
      },
      ~~ratings.usersRated === 0 ? '' : { m: ratings.mean },
      ~~ratings.usersRated === 0 ? '' : { r: ~~ratings.usersRated },
      ~~userCount === 0 ? '' : { u: ~~userCount },
      ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
    ))
  } else {
    store.count.added.push(canonicalTitle)
    store.data.data.push({
      i: ~~id,
      t: canonicalTitle,
      u: subtype === 'TV' ? 0 : 1, // 0: TV, 1: ONA
      d: [Object.assign(
        {
          i: 0, // Index
          d: ~~(TIMESTAMP / 3600000).toFixed(0) // Hours since epoch
        },
        ~~ratings.usersRated === 0 ? '' : { m: ratings.mean },
        ~~ratings.usersRated === 0 ? '' : { r: ~~ratings.usersRated },
        ~~userCount === 0 ? '' : { u: ~~userCount },
        ~~favoritesCount === 0 ? '' : { f: ~~favoritesCount }
      )]
    })
  }
  return
}
