import { TIMESTAMP, SEASON } from '../../constants'
import { store, mean, doNotPrune, season } from '../'

export function checkExists ({ ratingFrequencies, id, canonicalTitle, subtype, userCount, favoritesCount, startDate, status }) {
  const ratings = mean(ratingFrequencies)

  if (ratings.usersRated < 5) return

  if (status === 'current' && season(startDate) === SEASON) store.currentlyAiring.push(canonicalTitle)

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

/*
import { getMean, setAnime, updateAnime, counters } from './'
import { db } from './db'
import { season, year } from '../../src/util'

export async function checkExists (data) {
  try {
    const ratings = getMean(data.ratingFrequencies)
    const isThisSeason = season(data.startDate) === season() && year(data.startDate) === year()
    // Require at least 1 rating...or have started airing in the current season
    if (ratings.mean > 0 || isThisSeason) {
      if (!db.get(`data.${data.id}`).value()) await setAnime(data.id, data, ratings)
      else await updateAnime(data.id, data, ratings)
      counters.updated.push(data.canonicalTitle)
    } else counters.skipped.push(data.canonicalTitle)
  } catch (E) {
    console.error(`Errored while checking if ${data.canonicalTitle} (${db.id}) was in database:`)
    throw E
  }
}
*/
