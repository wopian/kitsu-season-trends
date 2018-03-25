import { TIMESTAMP, SEASON } from '../../constants'
import { store, mean, doNotPrune, season } from '../'

export function checkExists ({ ratingFrequencies, id, canonicalTitle, subtype, userCount, favoritesCount, startDate, status }) {
  const ratings = mean(ratingFrequencies)

  if (ratings.usersRated < 5) return

  // Started airing in the current season - excluding leftovers
  if (season(startDate) === SEASON) store.currentlyAiring.push(canonicalTitle)

  const entry = store.data.data.find(anime => ~~anime.i === ~~id)
  if (entry) {
    doNotPrune(id)
    store.count.updated.push(canonicalTitle)
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
      t: canonicalTitle,
      u: subtype === 'TV' ? 0 : 1, // 0: TV, 1: ONA
      d: [Object.assign(
        {
          id: 0, // Index
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
